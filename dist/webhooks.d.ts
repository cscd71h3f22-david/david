/// <reference types="node" />
import express from 'express';
import { events } from './event';
import { TaskFn } from './task';
export interface HttpsConfig {
    key: Buffer;
    cert: Buffer;
}
export interface WebhookConfig {
    homepage?: boolean;
    port?: number;
    apiKey: string;
    httpsConfig?: HttpsConfig;
    /**
     *
     * Careful not to override webhook endpoints.
     */
    customEndpoints?: express.Router;
}
export type WebhookVerifier = (req: express.Request) => boolean | Promise<boolean>;
export declare class WebhookServer {
    private readonly apiKey;
    private readonly port;
    private readonly app;
    private readonly httpsConfig;
    readonly webhookEventToTask: Map<events.WebhookEvent, TaskFn[]>;
    private readonly homepage;
    private readonly customEndpoints;
    /**
     *
     * @param param0 Webhook Configurations
     */
    constructor({ apiKey, port, httpsConfig, homepage, customEndpoints }: WebhookConfig);
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
     * Add a task to a given webhook event
     * @param eventName event name to add a task to
     * @param task task to execute
     */
    registerEvent(event: events.WebhookEvent, task: TaskFn): void;
    /**
     * Remove event from the set
     * @param event event to remove
     */
    removeEvent(event: events.WebhookEvent): void;
}
