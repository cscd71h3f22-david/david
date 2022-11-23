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
    private tasks;
    private eventToTasks;
    constructor(config?: DavidConfig);
    start(): void;
    on(eventOrChain: Event | EventChain, task: tasks.Task): this;
}
export {};
