"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.David = void 0;
const http_1 = __importDefault(require("http"));
const event_1 = require("./event");
/**
 * A class responsible for managing global tasks and events.
 * It's recommanded to have only one instance of David exist at a time.
 */
class David {
    constructor(config) {
        this.tasks = [];
        this.eventToTasks = new Map();
        if (config) {
            const { webhook } = config;
            this.webhook = webhook;
        }
    }
    start() {
        console.log('David started!');
        for (const [event, tasks] of this.eventToTasks) {
            for (const task of tasks) {
                event.register(task.exec);
            }
        }
        if (this.webhook) {
            this.startHTTPServer();
        }
    }
    on(eventOrChain, task) {
        if (eventOrChain instanceof event_1.Event) {
            // First parameter is an event
            let event = eventOrChain;
            if (this.eventToTasks.has(event)) {
                this.eventToTasks.get(event).push(task);
            }
            else {
                this.eventToTasks.set(event, [task]);
            }
        }
        else if (eventOrChain instanceof event_1.EventChain) {
            // First parameter is an event chain
            let events = eventOrChain.events;
            for (const event of events) {
                this.on(event, task);
            }
        }
        return this;
    }
    startHTTPServer() {
        const server = new http_1.default.Server((req, res) => {
            // TODO: Figure out how to implement webhook event listener. How much freedom do we want to give our users.
        });
    }
}
exports.David = David;
