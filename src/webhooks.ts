import express, { Express } from 'express';
import http from 'http';
import https from 'https';
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

export class WebhookServer {
    private readonly apiKey: string;
    private readonly port: number;
    private readonly app: Express;
    private readonly httpsConfig: HttpsConfig | undefined;
    public readonly webhookEventToTask: Map<events.WebhookEvent, TaskFn[]> = new Map();
    private readonly homepage: boolean;
    private readonly customEndpoints: express.Router;

    /**
     * 
     * @param param0 Webhook Configurations
     */
    constructor({apiKey, port, httpsConfig, homepage, customEndpoints}: WebhookConfig) {
        this.apiKey = apiKey;
        this.port = httpsConfig ? port ?? 443 : port ?? 80;
        this.httpsConfig = httpsConfig;
        this.homepage = homepage ?? true;
        this.customEndpoints = customEndpoints ?? express.Router();

        this.app = this.buildApp();
    }

    /**
     * Returns an application built with webhook events
     * @returns a web application built with express
     */
    private buildApp() {
        const app = express();
	app.use(express.json());
        if (this.homepage) {
            app.get('/', (_, res: express.Response) => {
                res.status(200).send('Welcome to David, our automation server! David is now listening to webhook requests. ')
            });
        }

        app.use('/', this.customEndpoints);

        app.use(async (req, res) => {
            for (const [event, tasks] of this.webhookEventToTask) {
                if (req.method.toUpperCase() === event.method.toUpperCase() 
                    && req.path === event.path 
                    && await event.verifier(req)
                ) {
                    tasks.forEach(taskFn => taskFn());
                }
            }
            res.status(200).end();
        });
        
        return app;
    }

    /**
     * Starts the web application for the events
     */
    public start(): void {

        const listeningListener = () => {
            console.log(`David listening on port ${this.port}`);
        }

        if (this.httpsConfig) {
            https.createServer(this.httpsConfig, this.app).listen(this.port, listeningListener);
            return;
        }
        http.createServer(this.app).listen(this.port, listeningListener);
    }

    /**
     * Add a task to a given webhook event
     * @param eventName event name to add a task to
     * @param task task to execute
     */
    public registerEvent(event: events.WebhookEvent, task: TaskFn): void {
        if (this.webhookEventToTask.has(event)) {
            this.webhookEventToTask.get(event)?.push(task);
            return;
        }
        this.webhookEventToTask.set(event, [task]);
    }

    /**
     * Remove event from the set
     * @param event event to remove
     */
    public removeEvent(event: events.WebhookEvent): void {
        this.webhookEventToTask.delete(event);
    }
}

