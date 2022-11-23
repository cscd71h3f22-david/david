import { TaskFn } from './task';
export interface WebhookConfig {
    /**
     * Port of the webhook listener server.
     * Defaults to 5000.
     */
    port?: number;
    apiKey: string;
}
export declare class WebhookServer {
    private readonly apiKey;
    private readonly port;
    private readonly app;
    private webhookEventToTask;
    constructor({ apiKey, port }: WebhookConfig);
    buildApp(): import("express-serve-static-core").Express;
    start(): void;
    getTasks(): Map<string, TaskFn>;
    registerEvent(eventName: string, task: TaskFn): void;
    removeEvent(eventName: string): void;
}
