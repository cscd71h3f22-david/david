export declare class Event {
    name: string;
    startTime: Date;
    endTime: Date;
    interval: number;
    desc: string;
    handler: any;
    constructor(name: string, startTime: Date, endTime: Date, interval: number, desc: string, handler: any);
}
