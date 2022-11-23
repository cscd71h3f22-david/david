"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookServer = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
class WebhookServer {
    constructor({ apiKey, port }) {
        this.webhookEventToTask = new Map();
        this.apiKey = apiKey;
        this.port = port !== null && port !== void 0 ? port : 5000;
        this.app = this.buildApp();
    }
    buildApp() {
        const app = (0, express_1.default)();
        app.get('/trigger', (req, res) => {
            if (!(req.query.id instanceof String && req.query.apikey instanceof String)) {
                res.status(400).send('Invalid input.');
            }
            if (req.query.apikey !== this.apiKey) {
                res.status(403).send('Unauthorized.');
            }
            const tasks = this.getTasks();
            const eventId = req.query.id;
            if (!tasks.has(eventId)) {
                res.status(404).send('Event Id does not exist.');
            }
            const task = tasks.get(eventId);
            task();
            res.status(200).send('Event ' + req.query.id + ' triggered!');
        });
        return app;
    }
    start() {
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
