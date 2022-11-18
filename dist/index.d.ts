export declare class Task {
    events: Event[];
    contract: any;
    latestBlock: number;
    abi: any;
    constructor(contractAddr: any, abi: any, provider: any, latestBlock: number);
    addEvent(event: Event): void;
    handleEvent(event: Event, startingQueryBlock: number, latestBlock: number): Promise<void>;
    queryChain: () => Promise<void>;
    startTask(): void;
}
export declare class Event {
    name: string;
    startTime: Date;
    endTime: Date;
    interval: number;
    desc: string;
    constructor(name: string, startTime: Date, endTime: Date, interval: number, desc: string);
}
