import { ethers } from "ethers";
import { TaskFn } from "./task";
import { WebhookServer } from "./webhooks";
type UnregisterFn = () => void;
type OnceEventConfig = Omit<EventConfigBase, 'endTime'> | void;
interface EventConfigBase {
    startTime?: Date;
    endTime?: Date;
}
/**
 * Contain the logic of when to call a task function.
 */
export declare abstract class Event {
    protected _startTime?: Date;
    protected _endTime?: Date;
    constructor(config: EventConfigBase);
    /**
     * Register the task function onto corresponding event listeners.
     * If endTime is set, auto un-registers the function upon endTime.
     *
     * @param exec
     */
    register(exec: TaskFn): void;
    /**
     * @returns time (in ms) until the event started. 0 if the event has already started.
     */
    timeUntilStart(): number;
    /**
     * @returns time (in ms) until the event ended. 0 if the event has already ended. +inf if the event lasts forever.
     */
    timeUntilEnd(): number;
    and(event: Event): EventChain;
    get startTime(): Date | undefined;
    get endTime(): Date | undefined;
    /**
     * Registers the function to be executed onto corresponding event listeners.
     *
     * @param exec The function to be executed upon trigger.
     * @returns UnregisterFn: A function to be called at this.endTime.
     */
    protected abstract _register(exec: TaskFn): UnregisterFn;
}
/**
 * Allows the user to chain events together using .or()
 */
export declare class EventChain {
    readonly events: Event[];
    constructor();
    and(event: Event): EventChain;
}
/**
 * Different types of events
 */
export declare namespace events {
    export class OnceEvent extends Event {
        constructor(config: OnceEventConfig);
        protected _register(exec: TaskFn): UnregisterFn;
    }
    interface IntervalEventConfig extends EventConfigBase {
        interval: number;
    }
    export class IntervalEvent extends Event {
        readonly interval: number;
        private intervalTimer;
        constructor({ startTime, endTime, interval }: IntervalEventConfig);
        protected _register(exec: TaskFn): UnregisterFn;
    }
    interface CronEventConfig extends EventConfigBase {
        cron: string;
    }
    export class CronEvent extends Event {
        readonly cron: string;
        constructor({ startTime, endTime, cron }: CronEventConfig);
        protected _register(exec: TaskFn): UnregisterFn;
    }
    interface OnchainEventConfig extends EventConfigBase {
        eventName: string;
        contract: ethers.Contract;
    }
    export class OnchainEvent extends Event {
        readonly contract: ethers.Contract;
        readonly eventName: string;
        constructor({ contract, eventName, startTime, endTime }: OnchainEventConfig);
        protected _register(exec: TaskFn): UnregisterFn;
    }
    interface WebhookEventConfig extends EventConfigBase {
        eventName: string;
    }
    export class WebhookEvent extends Event {
        webhookServer: WebhookServer | undefined;
        readonly name: string;
        constructor({ eventName, startTime, endTime }: WebhookEventConfig);
        setWebhookServer(webhookServer: WebhookServer): void;
        protected _register(exec: TaskFn): UnregisterFn;
    }
    export type EventConfig = OnceEventConfig | IntervalEventConfig | CronEventConfig | OnchainEventConfig;
    export {};
}
export {};
