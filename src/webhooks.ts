import express, { Express } from 'express';
import http from 'http';
import { TaskFn } from './task';

export interface WebhookConfig {
    /**
     * Port of the webhook listener server.
     * Defaults to 5000.
     */
    port?: number;
    apiKey: string;
}

export class WebhookServer {
    private readonly apiKey: string;
    private readonly port: number;
    private readonly app: Express;
    private webhookEventToTask: Map<string, TaskFn> = new Map();

    constructor({apiKey, port}: WebhookConfig) {
        this.apiKey = apiKey;
        this.port = port ?? 5000;
        this.app = this.buildApp();
    }

    public buildApp() {
        const app = express();
        app.get('/trigger', (req: express.Request, res: express.Response) => {
            if (!(req.query.id instanceof String && req.query.apikey instanceof String)) {
                res.status(400).send('Invalid input.')
            }
            if (req.query.apikey !== this.apiKey) {
                res.status(403).send('Unauthorized.');
            }
            const tasks = this.getTasks();
            const eventId = <string>req.query.id;
            if (!tasks.has(eventId)) {
                res.status(404).send('Event Id does not exist.');
            }
            const task = <TaskFn>tasks.get(eventId);
            task();
            res.status(200).send('Event ' + req.query.id + ' triggered!');
        });
        return app;
    }

    public start(): void {
        http.createServer(this.app).listen(this.port);
    }

    public getTasks(): Map<string, TaskFn> {
        return this.webhookEventToTask;
    }

    public registerEvent(eventName: string, task: TaskFn): void {
        this.webhookEventToTask.set(eventName, task);
    }

    public removeEvent(eventName: string): void {
        this.webhookEventToTask.delete(eventName);
    }
}

