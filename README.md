# david-bot
https://www.npmjs.com/package/david-bot

- Supports modern JavaScript and TypeScript
- Automation of events over the Ethereum blockchain
  - Customizable event triggers and actions
  - Webhook support



#### Key Terms

`David`: The "Bot". This object contains a list of events, webhooks, and tasks mapped to their respective events.

`Task`: Task (or action) to run when some event is emitted

`Event`: Conditions of listening to a specified event on a contract on the Ethereum blockchain



#### Usage

##### Installation

```
npm install david-bot
```

##### Project Setup

```js
const provider = () =>
  new ethers.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/85f7b13fcd2b4b8fbfde6a4fbea02b6d"
  );

const contract = new ethers.Contract(
  "0xA3b81CF9bf1D18C85C1Bf25d15361CF9A788BA3b", // contract address
  abi, 
  provider()
);
```

##### Creating a David Object

```js
const dave = new david.David({webhook: {
  apiKey: "garongschickchen",
  httpsConfig: {
    key: privateKey,
    cert: certificate
  }
}});
```

##### Creating a Task

```js
// Basic task
const task = new david.tasks.Task("Deposit to fund A", () => {
  console.log('Deposited 100000 Wei to fund contract');
});
```

##### Creating Events

```js
// cron (scheduled) event
const event1 = new david.events.CronEvent({
  startTime: new Date(), 
  endTime: new Date(Date.now() + 20 * 24 * 3600 * 1000), 
  cron: '* * * * mon'
});

// Actively listens to event 'Vote' from the fundAContract
const event2 = new david.events.OnchainEvent({
  contract: fundAContract,
  eventName: 'Vote'
});

// Webhook event
const event3 = new david.events.WebhookEvent({
  eventName: 'dapptechnologyinc'
});
```

##### Mapping Events to Tasks

```ts
dave.on(
  task1.and(task2),
  event
);

dave.on(
  task,
  event
)
```

##### Start

```js
dave.start();
```

### Full Examples
#### Javascript
```js
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import EchoABI from "./ABI.json" assert { "type": "json" };
import david from "david-bot";

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const brokenProvider = new ethers.providers.JsonRpcProvider(
  process.env.DEAD_PROVIDER_URL
);

const echoContract = new david.default.Contract(
  "0x7FF8982B3e3135f46DB12E17BaD5b8d9E1a08c54",
  EchoABI
);

const dave = new david.default.David();

const getCurrentTime = () =>
  new Date().toLocaleString("en-CA", { timeZone: "America/New_York" });
const log = (...args) => console.log(`${getCurrentTime()}`, ...args);

const echoEventFired = new david.default.events.OnchainEvent({
  contract: echoContract,
  eventName: "EchoEvent",
  providerName: "goerli",
});

const logEvent = new david.default.tasks.Task("Log Event Data", (...args) => {
  log(`Event heard: [${args[0]}]`);
});

dave
  .registerProvider("goerli", provider)
  .registerProvider("broken", brokenProvider)
  .on(echoEventFired, logEvent)
  .start();
```
#### Typescript
```ts
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import EchoABI from "./ABI.json";
import david from "david-bot";

const provider = new ethers.providers.JsonRpcProvider(
  process.env.PROVIDER_URL!
);

const echoContract = new david.Contract(
  "0x7FF8982B3e3135f46DB12E17BaD5b8d9E1a08c54",
  EchoABI
);

const dave = new david.David();

const getCurrentTime = () =>
  new Date().toLocaleString("en-CA", { timeZone: "America/New_York" });
const log = (...args: any[]) => console.log(`${getCurrentTime()}`, ...args);

const echoEventFired = new david.events.OnchainEvent({
  contract: echoContract,
  eventName: "EchoEvent",
  providerName: "goerli",
});

const logEvent = new david.tasks.Task("Log Event Data", (...args) => {
  log(`Event heard: [${args[0]}]`);
});

dave.registerProvider("goerli", provider).on(echoEventFired, logEvent).start();
```

### Dev Notes

tsc --project tsconfig.json

npx ts-node ./example/index.ts

https://localhost/api/trigger?id=dapptechnologyinc&apikey=garongschickchen
