import express, { Express } from 'express';
import http from 'http';
import https from 'https';
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

export class WebhookServer {
    private readonly apiKey: string;
    private readonly port: number;
    private readonly app: Express;
    private readonly httpsConfig: HttpsConfig | undefined;
    private webhookEventToTask: Map<string, TaskFn[]> = new Map();

    /**
     * 
     * @param param0 Webhook Configurations
     */
    constructor({apiKey, port, httpsConfig}: WebhookConfig) {
        this.apiKey = apiKey;
        this.port = httpsConfig ? port ?? 443 : port ?? 80;
        this.app = this.buildApp();
        this.httpsConfig = httpsConfig;
    }

    /**
     * Returns an application built with webhook events
     * @returns a web application built with express
     */
    private buildApp() {
        const app = express();
        app.get('/', (_, res: express.Response) => {
            res.status(200).send('Welcome to David, our automation server! Use /api/trigger/id=???&apikey=??? to invoke webhooks!')
        });
        app.get('/api/trigger', (req: express.Request, res: express.Response) => {
            if (req.query.apikey !== this.apiKey) {
                res.status(403).send('Unauthorized.');
                return;
            }
            const tasks = this.getTaskMapping();
            const eventId = <string>req.query.id;
            if (!tasks.has(eventId)) {
                res.status(404).send('Event Id does not exist.');
                return;
            }
            const tasksToRun = <TaskFn[]>tasks.get(eventId);
            for (const task of tasksToRun) {
                task();
            }
            res.sendStatus(200);
        });
        return app;
    }

    /**
     * Starts the web application for the events
     */
    public start(): void {
        if (this.httpsConfig) {
            https.createServer(this.httpsConfig, this.app).listen(this.port);
            return;
        }
        http.createServer(this.app).listen(this.port);
    }

    /**
     * Returns updated mapping with event ids to tasks
     * @returns maps such that event id -> task
     */
    public getTaskMapping(): Map<string, TaskFn[]> {
        return this.webhookEventToTask;
    }

    /**
     * Add a task to a given webhook event
     * @param eventName event name to add a task to
     * @param task task to execute
     */
    public registerEvent(eventName: string, task: TaskFn): void {
        if (this.webhookEventToTask.has(eventName)) {
            const updatedTasks = (<TaskFn[]>this.webhookEventToTask.get(eventName)).concat([task]);
            this.webhookEventToTask.set(eventName, updatedTasks);
            return;
        }
        this.webhookEventToTask.set(eventName, [task]);
    }

    /**
     * Remove event from the set
     * @param eventName event name to remove
     */
    public removeEvent(eventName: string): void {
        this.webhookEventToTask.delete(eventName);
    }
}

