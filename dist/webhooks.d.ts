/// <reference types="node" />
import { TaskFn } from './task';
export interface HttpsConfig {
    key: Buffer;
    cert: Buffer;
}
export interface WebhookConfig {
    port?: number;
    apiKey: string;
    httpsConfig?: HttpsConfig;
}
export declare class WebhookServer {
    private readonly apiKey;
    private readonly port;
    private readonly app;
    private readonly httpsConfig;
    private webhookEventToTask;
    /**
     *
     * @param param0 Webhook Configurations
     */
    constructor({ apiKey, port, httpsConfig }: WebhookConfig);
    buildApp(): import("express-serve-static-core").Express;
    start(): void;
    getTasks(): Map<string, TaskFn>;
    registerEvent(eventName: string, task: TaskFn): void;
    removeEvent(eventName: string): void;
}
