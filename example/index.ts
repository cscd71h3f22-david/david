import { ethers } from 'ethers';

import David from '../src';
import testAbi from './abi.json';

export const getTestnetProvider = () =>
  new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/85f7b13fcd2b4b8fbfde6a4fbea02b6d");

const newTask = new Task({
  contractAddr: "0xA3b81CF9bf1D18C85C1Bf25d15361CF9A788BA3b",
  abi: testAbi,
  provider: getTestnetProvider(),
  latestBlock: 7973272
});

newTask.addEvent({
  eventName: "Deposit"
});

newTask.start();