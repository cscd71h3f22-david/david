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
    private webhookEventToTask: Map<string, TaskFn> = new Map();

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

    public buildApp() {
        const app = express();
        app.get('/', (_, res: express.Response) => {
            res.status(200).send('Welcome to David, our automation server! Use /api/trigger/id=???&apikey=??? to invoke webhooks!')
        });
        app.get('/api/trigger', (req: express.Request, res: express.Response) => {
            console.log(req.query.id, req.query.apikey)
            // if (!(req.query.id instanceof String && req.query.apikey instanceof String)) {
            //     res.status(400).send('Invalid input.');
            //     return;
            // }
            if (req.query.apikey !== this.apiKey) {
                res.status(403).send('Unauthorized.');
                return;
            }
            const tasks = this.getTasks();
            const eventId = <string>req.query.id;
            if (!tasks.has(eventId)) {
                res.status(404).send('Event Id does not exist.');
                return;
            }
            const task = <TaskFn>tasks.get(eventId);
            task();
            res.sendStatus(200);
        });
        return app;
    }

    public start(): void {
        if (this.httpsConfig) {
            https.createServer(this.httpsConfig, this.app).listen(this.port);
            return;
        }
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

