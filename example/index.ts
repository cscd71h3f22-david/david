import { ethers } from "ethers";
import dotenv from 'dotenv';
dotenv.config();

import david from "../src";
import fundAAbi from './fundA_abi.json';
import fundBAbi from './fundB_abi.json';

const getTestnetProvider = () =>
  new ethers.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/85f7b13fcd2b4b8fbfde6a4fbea02b6d"
  );

const fundAContract = new ethers.Contract(
  "0xA3b81CF9bf1D18C85C1Bf25d15361CF9A788BA3b",
  fundAAbi, 
  getTestnetProvider()
);

const fundBContract = new ethers.Contract(
  "0x47b9c9705096aB0AF315d1A342BBF78C0671Da6C",
  fundBAbi,
  getTestnetProvider()
);

/**
 * The following code demonstrates how to use david to automatically deposit to fund A 
 * on every Monday in the next 30 days, 
 *  and when someone voted on fund B.
 * 
 * Note fund A and B does not necessarily have to be on the same chain. 
 */

const dave = new david.David();

const depositToFundA = new david.tasks.Task("Deposit to fund A", () => {
  // Deposit to fund A. 
  console.log('Deposited 100000 Wei to fund contract');
});

const everyMondayInTheNext30Days = new david.events.CronEvent({
  startTime: new Date(), 
  //endTime: new Date(Date.now() + 30 * 24 * 3600 * 1000), 
  cron: '* * * * mon'
});

const someoneVotedOnFundB = new david.events.OnchainEvent({
  contract: fundBContract,
  eventName: 'Vote'
}); 

dave.on(
  everyMondayInTheNext30Days
    .and(someoneVotedOnFundB),
  depositToFundA
);

dave.start();