import { ethers } from "ethers";
import {  address, MAX_BLOCKS_READ } from "./constants";

interface TaskConfig {
  contractAddr: address;
  abi: ethers.ContractInterface;
  provider: ethers.providers.Provider;
  latestBlock: number;
}

export class Task {
  public events: Event[];
  public contract: ethers.Contract;
  public abi: ethers.ContractInterface;
  public provider: ethers.providers.Provider;
  public latestBlock: number;

  constructor({
    contractAddr, 
    abi, 
    provider, 
    latestBlock
  }: TaskConfig) {
    this.latestBlock = latestBlock;
    this.abi = abi; 
    this.provider = provider;

    this.contract = new ethers.Contract(contractAddr, abi, provider);
    this.events = [];
  }

  addEvent(event: Event) {
    this.events.push(event);
  }

  async handleEvent(
    event: Event,
    startingQueryBlock: number,
    latestBlock: number
  ) {
    let queryEvent = await this.contract.queryFilter(
      event.name,
      startingQueryBlock + 1,
      latestBlock
    );

    for (let i = 0; i < queryEvent.length; i++) {
      let eventData = queryEvent[i];
      // TODO: insert parsing of data here
      console.log("eventData", eventData);
      /*
        let amount = eventData.args[0];
        let tokenIds = eventData.args[1];
        let timestamp = eventData.args[2];
        let account = eventData.args[3];
        let tokenData = eventData.args[4];
        let mediaUri = eventData.args[5];
      */

      // TODO: handle
    }
  }

  queryChain = async () => {
    // Start listening to the blockchain
    let startingQueryBlock = this.latestBlock;
    let latestBlock = Math.min(
      await this.contract.provider.getBlockNumber(),
      startingQueryBlock + MAX_BLOCKS_READ
    );
    console.log(`reading from ${startingQueryBlock} to ${latestBlock}`);

    this.events.forEach(async (event: Event) => {
      try {
        await this.handleEvent(event, startingQueryBlock, latestBlock);
      } catch (e) {
        console.error("block query error", e);
      }
    });

    this.latestBlock = latestBlock;
    // let exampleEvent = await this.contract.queryFilter(
    //   "TokenERC721Mint", // TODO: This will be replaced by the event name
    //   startingQueryBlock + 1,
    //   latestBlock
    // );
  };

  startTask() {
    // this.queryChain();
    setInterval(this.queryChain.bind(this), 1000);
  }
}

export class Event {
  constructor(
    public name: string,
    public startTime: Date,
    public endTime: Date,
    public interval: number,
    public desc: string
  ) {}
}