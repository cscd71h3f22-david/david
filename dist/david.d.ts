import { EventChain, Event } from './event';
import { tasks } from './task';
import { EthersProvider } from './utils';
import { WebhookConfig } from './webhooks';
interface DavidConfig {
    /**
     * When provided, David will start a http server to listen to webhook events.
     */
    webhook?: WebhookConfig;
}
/**
 * A class responsible for managing global tasks and events.
 * It's recommanded to have only one instance of David exist at a time.
 */
export declare class David {
    private webhook?;
    private webhookServer?;
    private eventToTasks;
    private providers;
    /**
     * Creates an instance of David
     * @param config configuration settings for David
     */
    constructor(config?: DavidConfig);
    /**
     * Registers events and starts the web servers for handling
     * webhooks.
     */
    start(): void;
    /**
     * Adds event and task to David
     * @param eventOrChain Event associated with the task
     * @param task Task to run when this event is emitted
     * @returns the David Object
     */
    on(eventOrChain: Event | EventChain | Event[], task: tasks.Task): David;
    /**
     *
     * @param name name of provider
     * @param providers ethers provider or list of ether providers.
     * @returns the David object
     */
    registerProvider(name: string, providers: EthersProvider): David;
    registerProvider(name: string, providers: EthersProvider[]): David;
}
export {};
