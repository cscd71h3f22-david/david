# david

- Supports modern JavaScript and TypeScript
- Automation of events over the Ethereum blockchain
  - Customizable event triggers and actions
  - Webhook support

https://www.npmjs.com/package/david-bot

#### Key Terms

`David`: The "Bot". This object contains a list of events, webhooks, and tasks mapped to their respective events.

`Task`: Task (or action) to run when some event is emitted

`Event`: Conditions of listening to a specified event on a contract on the Ethereum blockchain



#### Usage

##### Installation

```
npm install david-bot
```

### Code Examples
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
