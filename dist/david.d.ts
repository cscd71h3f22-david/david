import { EventChain, Event } from './event';
import { tasks } from './task';
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
     * @returns instance of David
     */
    on(eventOrChain: Event | EventChain | Event[], task: tasks.Task): David;
}
export {};
