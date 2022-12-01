/**
 * Emits an echo to a goerli Echo contract every 5 minutes. 
 * When an EchoEvent is emitted by such contract, print to log. 
 */
import { ethers } from 'ethers';
import dotenv from 'dotenv'; 
dotenv.config();

import EchoABI from './Echo.json';
import david from '../src'; 

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL!);

const echoContract = new ethers.Contract(
  "0x7FF8982B3e3135f46DB12E17BaD5b8d9E1a08c54",
  EchoABI,
  provider
);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const dave = new david.David();

const getCurrentTime = () => 
  new Date().toLocaleString('en-CA', {timeZone: "America/New_York"});
const log = (...args: any[]) => console.log(`${getCurrentTime()}`, ...args);


const rightNow = new david.events.OnceEvent();
const interval5Min = new david.events.IntervalEvent({interval: 5 * 60 * 1000}); 
let counter = 0;
const yellToEcho = new david.tasks.Task(
  "yell to Echo",
  async () => {
    const tx = await echoContract.connect(signer).echo(`${counter}`);
    log(`Echoed [${counter}]. Tx hsah ${tx.hash}`);
    counter ++;
  }
);

const echoEventFired = new david.events.OnchainEvent({
  contract: new david.Contract(echoContract.address, echoContract.interface), 
  eventName: 'EchoEvent', 
  providerName:'goerli'});

const logEvent = new david.tasks.Task('Log Event Data', (...args) => {
  log(`Event heard: [${args[0]}]`);
});

dave
  .registerProvider('goerli', provider)
  .on([rightNow, interval5Min], yellToEcho)
  .on(echoEventFired, logEvent)
  .start();