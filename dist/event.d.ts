import { Contract, EthersProvider } from "./utils";
import { tasks } from "./task";
import { WebhookServer, WebhookVerifier } from "./webhooks";
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
    readonly id: string;
    protected _startTime?: Date;
    protected _endTime?: Date;
    constructor(config: EventConfigBase);
    /**
     * Register the task function onto corresponding event listeners.
     * If endTime is set, auto un-registers the function upon endTime.
     *
     * @param exec
     */
    register(task: tasks.Task): void;
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
    protected abstract _register(task: tasks.Task): UnregisterFn;
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
        protected _register(task: tasks.Task): UnregisterFn;
    }
    interface IntervalEventConfig extends EventConfigBase {
        interval: number;
    }
    export class IntervalEvent extends Event {
        readonly interval: number;
        private intervalTimer;
        constructor({ startTime, endTime, interval }: IntervalEventConfig);
        protected _register(task: tasks.Task): UnregisterFn;
    }
    interface CronEventConfig extends EventConfigBase {
        cron: string;
    }
    export class CronEvent extends Event {
        readonly cron: string;
        constructor({ startTime, endTime, cron }: CronEventConfig);
        protected _register(task: tasks.Task): UnregisterFn;
    }
    interface OnchainEventConfig extends EventConfigBase {
        providerName: string;
        contract: Contract;
        eventName: string;
    }
    export class OnchainEvent extends Event {
        private config;
        private contracts;
        /**
         * block number => (combId + txIndx) []
         */
        private eventRecords;
        constructor(config: OnchainEventConfig);
        /**
         * Inject providers into the Event object.
         * @param providers
         */
        setProviders(providers: EthersProvider[]): void;
        get providerName(): string;
        protected _register(task: tasks.Task): UnregisterFn;
        private eventAlreadyTriggered;
    }
    interface WebhookEventConfig extends EventConfigBase {
        eventName: string;
        verifier: WebhookVerifier;
        path: string;
        method: string;
    }
    export class WebhookEvent extends Event {
        webhookServer: WebhookServer | undefined;
        readonly name: string;
        readonly verifier: WebhookVerifier;
        readonly path: string;
        readonly method: string;
        constructor({ eventName, startTime, endTime, verifier, path, method }: WebhookEventConfig);
        setWebhookServer(webhookServer: WebhookServer): void;
        protected _register(task: tasks.Task): UnregisterFn;
    }
    export type EventConfig = OnceEventConfig | IntervalEventConfig | CronEventConfig | OnchainEventConfig;
    export {};
}
export {};
