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
    /**
     * Returns an application built with webhook events
     * @returns a web application built with express
     */
    private buildApp;
    /**
     * Starts the web application for the events
     */
    start(): void;
    /**
     * Returns updated mapping with event ids to tasks
     * @returns maps such that event id -> task
     */
    getTaskMapping(): Map<string, TaskFn[]>;
    /**
     * Add a task to a given webhook event
     * @param eventName event name to add a task to
     * @param task task to execute
     */
    registerEvent(eventName: string, task: TaskFn): void;
    /**
     * Remove event from the set
     * @param eventName event name to remove
     */
    removeEvent(eventName: string): void;
}
