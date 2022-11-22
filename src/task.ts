// import { ethers } from "ethers";

// import { address, MAX_BLOCKS_READ } from "./constants";
// import {Event, EventConfig} from './event';

// interface TaskConfig {
//   contractAddr: address;
//   abi: ethers.ContractInterface;
//   provider: ethers.providers.Provider;
//   latestBlock: number;
// }

// // The function to be executed when an event is triggered. 
// export type TaskFn = () => void;

// export class Task {
//   public events: Event[];
//   public contract: ethers.Contract;
//   public abi: ethers.ContractInterface;
//   public provider: ethers.providers.Provider;
//   public latestBlock: number;

//   constructor({ contractAddr, abi, provider, latestBlock }: TaskConfig) {
//     this.latestBlock = latestBlock;
//     this.abi = abi;
//     this.provider = provider;

//     this.contract = new ethers.Contract(contractAddr, abi, provider);
//     this.events = [];
//   }

//   addEvent(event: EventConfig) {
//     this.events.push(event);
//   }

//   async handleEvent(
//     event: Event,
//     startingQueryBlock: number,
//     latestBlock: number
//   ) {
//     let queryEvent = await this.contract.queryFilter(
//       event.name,
//       startingQueryBlock + 1,
//       latestBlock
//     );

//     for (let i = 0; i < queryEvent.length; i++) {
//       let eventData = queryEvent[i];
//       // TODO: insert parsing of data here
//       console.log("eventData", eventData);

//       await event.handler(eventData);
//     }
//   }

//   queryChain = async () => {
//     // Start listening to the blockchain
//     let startingQueryBlock = this.latestBlock;
//     let latestBlock = Math.min(
//       await this.contract.provider.getBlockNumber(),
//       startingQueryBlock + MAX_BLOCKS_READ
//     );
//     console.log(`reading from ${startingQueryBlock} to ${latestBlock}`);

//     this.events.forEach(async (event: Event) => {
//       try {
//         await this.handleEvent(event, startingQueryBlock, latestBlock);
//       } catch (e) {
//         console.error("block query error", e);
//       }
//     });

//     this.latestBlock = latestBlock;
//   };

//   start() {
//     // this.queryChain();
//     setInterval(this.queryChain, 1000);
//   }
// }
import { David } from "./david";
import { Event } from "./event";

export type TaskFn = () => void;

export namespace tasks {
  
  /**
   * Contain the task to be executed when an event is triggered.
   */
  export class Task {

    public readonly exec: TaskFn;

    constructor(
      public readonly name: string,
      exec: TaskFn,
    ) {
      this.exec = () => {
        try {
          exec();
        } catch (e) {
          console.error(`Task ${this.name} failed with error:`);
          console.error(e);
        }
      }
    }

  }
}