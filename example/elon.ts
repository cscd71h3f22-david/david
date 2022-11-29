import david from "../src";
import express from "express";
import crypto from "crypto";
import dotenv from 'dotenv';
dotenv.config();

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
        const bodyObj = JSON.parse(req.body);
        const events: any[] = bodyObj.favorite_events; 
        for (const event of events) {
            if (event.favorited_status.user.id === "") {
                return true;
            }
        }
        return false;
    }
});

const doSomething = new david.tasks.Task(
    "something", 
    () => {
        console.log("Liked an Elon tweet");
    }
);

dave.on(
    likedAnElonTweet,
    doSomething
);

dave.start();