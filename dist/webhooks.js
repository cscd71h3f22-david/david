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
    buildApp() {
        const app = (0, express_1.default)();
        app.get('/', (_, res) => {
            res.status(200).send('Welcome to David, our automation server! Use /api/trigger/id=???&apikey=??? to invoke webhooks!');
        });
        app.get('/api/trigger', (req, res) => {
            console.log(req.query.id, req.query.apikey);
            // if (!(req.query.id instanceof String && req.query.apikey instanceof String)) {
            //     res.status(400).send('Invalid input.');
            //     return;
            // }
            if (req.query.apikey !== this.apiKey) {
                res.status(403).send('Unauthorized.');
                return;
            }
            const tasks = this.getTasks();
            const eventId = req.query.id;
            if (!tasks.has(eventId)) {
                res.status(404).send('Event Id does not exist.');
                return;
            }
            const task = tasks.get(eventId);
            task();
            res.sendStatus(200);
        });
        return app;
    }
    start() {
        if (this.httpsConfig) {
            https_1.default.createServer(this.httpsConfig, this.app).listen(this.port);
            return;
        }
        http_1.default.createServer(this.app).listen(this.port);
    }
    getTasks() {
        return this.webhookEventToTask;
    }
    registerEvent(eventName, task) {
        this.webhookEventToTask.set(eventName, task);
    }
    removeEvent(eventName) {
        this.webhookEventToTask.delete(eventName);
    }
}
exports.WebhookServer = WebhookServer;
