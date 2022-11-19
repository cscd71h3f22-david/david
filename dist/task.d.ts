import { ethers } from "ethers";
import { address } from "./constants";
import { Event } from "./event";
interface TaskConfig {
    contractAddr: address;
    abi: ethers.ContractInterface;
    provider: ethers.providers.Provider;
    latestBlock: number;
}
export declare class Task {
    events: Event[];
    contract: ethers.Contract;
    abi: ethers.ContractInterface;
    provider: ethers.providers.Provider;
    latestBlock: number;
    constructor({ contractAddr, abi, provider, latestBlock }: TaskConfig);
    addEvent(event: Event): void;
    handleEvent(event: Event, startingQueryBlock: number, latestBlock: number): Promise<void>;
    queryChain: () => Promise<void>;
    start(): void;
}
export {};
