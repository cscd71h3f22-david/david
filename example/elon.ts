import david from "../src";
import express from "express";
import crypto from "crypto";
import dotenv from 'dotenv';
import { ethers } from "ethers";
dotenv.config();
import fundBAbi from './fundB_abi.json';

// Ethers.js objects

const getTestnetProvider = () =>
  new ethers.providers.JsonRpcProvider(
    process.env.PROVIDER_URL!
  );

const fundBContract = new ethers.Contract(
  "0x47b9c9705096aB0AF315d1A342BBF78C0671Da6C",
  fundBAbi,
  getTestnetProvider()
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, getTestnetProvider());
/**
 * This example deposits into fund B whenever the user likes an Elon Musk tweet.
 */

const customEndpoints = express.Router();
// To pass the twitter webhook CRC test
customEndpoints.get("/webhooks/twitter", (req, res) => {
    const crc_token = req.query["crc_token"];
    if (!crc_token) {
        res.status(401).end();
        return;
    }
    const hash = crypto.createHmac('sha256', process.env.TWITTER_API_SECRET!)
        .update(crc_token as string)
        .digest("base64");
    res.json({
        response_token: `sha256=${hash}`
    });
});

const dave = new david.David({
    webhook: {
        homepage: true,
        port: 5000,
        customEndpoints,
        apiKey: ""
    }
});

const likedAnElonTweet = new david.events.WebhookEvent({
    eventName: "liked a tweet by Elon Musk", 
    method: "POST",
    path: "/webhooks/twitter",
    verifier: (req) => {
        const events: any[] = req.body.favorite_events; 
        for (const event of events) {
            if (event.favorited_status.user.id === "") {
                return true;
            }
        }
        return false;
    }
});

const depositToFundB = new david.tasks.Task(
    "Deposit to fund B", 
    async () => {
        console.log('Deposit into fund B');
        const depositAmt = ethers.BigNumber.from(10000000000);
        const tx = await fundBContract.connect(signer).deposit(depositAmt, {value: depositAmt});
        console.log(`Transaction created: https://goerli.etherscan.io/tx/${tx.hash}`);
    }
);

dave.on(
    likedAnElonTweet, 
    depositToFundB
);

dave.start();