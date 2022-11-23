"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookServer = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
class WebhookServer {
    /**
     *
     * @param param0 Webhook Configurations
     */
    constructor({ apiKey, port, httpsConfig }) {
        this.webhookEventToTask = new Map();
        this.apiKey = apiKey;
        this.port = httpsConfig ? port !== null && port !== void 0 ? port : 443 : port !== null && port !== void 0 ? port : 80;
        this.app = this.buildApp();
        this.httpsConfig = httpsConfig;
    }
    /**
     * Returns an application built with webhook events
     * @returns a web application built with express
     */
    buildApp() {
        const app = (0, express_1.default)();
        app.get('/', (_, res) => {
            res.status(200).send('Welcome to David, our automation server! Use /api/trigger/id=???&apikey=??? to invoke webhooks!');
        });
        app.get('/api/trigger', (req, res) => {
            if (req.query.apikey !== this.apiKey) {
                res.status(403).send('Unauthorized.');
                return;
            }
            const tasks = this.getTaskMapping();
            const eventId = req.query.id;
            if (!tasks.has(eventId)) {
                res.status(404).send('Event Id does not exist.');
                return;
            }
            const tasksToRun = tasks.get(eventId);
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
    start() {
        if (this.httpsConfig) {
            https_1.default.createServer(this.httpsConfig, this.app).listen(this.port);
            return;
        }
        http_1.default.createServer(this.app).listen(this.port);
    }
    /**
     * Returns updated mapping with event ids to tasks
     * @returns maps such that event id -> task
     */
    getTaskMapping() {
        return this.webhookEventToTask;
    }
    /**
     * Add a task to a given webhook event
     * @param eventName event name to add a task to
     * @param task task to execute
     */
    registerEvent(eventName, task) {
        if (this.webhookEventToTask.has(eventName)) {
            const updatedTasks = this.webhookEventToTask.get(eventName).concat([task]);
            this.webhookEventToTask.set(eventName, updatedTasks);
            return;
        }
        this.webhookEventToTask.set(eventName, [task]);
    }
    /**
     * Remove event from the set
     * @param eventName event name to remove
     */
    removeEvent(eventName) {
        this.webhookEventToTask.delete(eventName);
    }
}
exports.WebhookServer = WebhookServer;
