export declare class Task {
    contract: any;
    abi: any;
    events: Event[];
    constructor(contract: any, abi: any);
    addEvent(event: Event): void;
    startTask(): void;
}
export declare class Event {
    startTime: Date;
    endTime: Date;
    interval: number;
    desc: string;
    constructor(startTime: Date, endTime: Date, interval: number, desc: string);
}
