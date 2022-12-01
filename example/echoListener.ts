/**
 * Listens to the echo contract
 */
 import { ethers } from 'ethers';
 import dotenv from 'dotenv'; 
 dotenv.config();
 
 import EchoABI from './Echo.json';
 import david from '../src'; 
 
 const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL!);
 
 const echoContract = new david.Contract(
   "0x7FF8982B3e3135f46DB12E17BaD5b8d9E1a08c54",
   EchoABI,
 );
 
 const dave = new david.David();
 
 const getCurrentTime = () => 
   new Date().toLocaleString('en-CA', {timeZone: "America/New_York"});
 const log = (...args: any[]) => console.log(`${getCurrentTime()}`, ...args);

 const echoEventFired = new david.events.OnchainEvent({
   contract: echoContract, 
   eventName: 'EchoEvent', 
   providerName:'goerli'});
 
 const logEvent = new david.tasks.Task('Log Event Data', (...args) => {
   log(`Event heard: [${args[0]}]`);
 });
 
 dave
   .registerProvider('goerli', provider)
   .on(echoEventFired, logEvent)
   .start();