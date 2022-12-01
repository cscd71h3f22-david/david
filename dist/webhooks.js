"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    constructor({ apiKey, port, httpsConfig, homepage, customEndpoints }) {
        this.webhookEventToTask = new Map();
        this.apiKey = apiKey;
        this.port = httpsConfig ? port !== null && port !== void 0 ? port : 443 : port !== null && port !== void 0 ? port : 80;
        this.httpsConfig = httpsConfig;
        this.homepage = homepage !== null && homepage !== void 0 ? homepage : true;
        this.customEndpoints = customEndpoints !== null && customEndpoints !== void 0 ? customEndpoints : express_1.default.Router();
        this.app = this.buildApp();
    }
    /**
     * Returns an application built with webhook events
     * @returns a web application built with express
     */
    buildApp() {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        if (this.homepage) {
            app.get('/', (_, res) => {
                res.status(200).send('Welcome to David, our automation server! David is now listening to webhook requests. ');
            });
        }
        app.use('/', this.customEndpoints);
        app.use((req, res) => __awaiter(this, void 0, void 0, function* () {
            for (const [event, tasks] of this.webhookEventToTask) {
                if (req.method.toUpperCase() === event.method.toUpperCase()
                    && req.path === event.path
                    && (yield event.verifier(req))) {
                    tasks.forEach(taskFn => taskFn());
                }
            }
            res.status(200).end();
        }));
        return app;
    }
    /**
     * Starts the web application for the events
     */
    start() {
        const listeningListener = () => {
            console.log(`David listening on port ${this.port}`);
        };
        if (this.httpsConfig) {
            https_1.default.createServer(this.httpsConfig, this.app).listen(this.port, listeningListener);
            return;
        }
        http_1.default.createServer(this.app).listen(this.port, listeningListener);
    }
    /**
     * Add a task to a given webhook event
     * @param eventName event name to add a task to
     * @param task task to execute
     */
    registerEvent(event, task) {
        var _a;
        if (this.webhookEventToTask.has(event)) {
            (_a = this.webhookEventToTask.get(event)) === null || _a === void 0 ? void 0 : _a.push(task);
            return;
        }
        this.webhookEventToTask.set(event, [task]);
    }
    /**
     * Remove event from the set
     * @param event event to remove
     */
    removeEvent(event) {
        this.webhookEventToTask.delete(event);
    }
}
exports.WebhookServer = WebhookServer;
