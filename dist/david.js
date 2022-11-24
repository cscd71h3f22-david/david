"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.David = void 0;
const event_1 = require("./event");
const webhooks_1 = require("./webhooks");
/**
 * A class responsible for managing global tasks and events.
 * It's recommanded to have only one instance of David exist at a time.
 */
class David {
    /**
     * Creates an instance of David
     * @param config configuration settings for David
     */
    constructor(config) {
        this.tasks = [];
        this.eventToTasks = new Map();
        if (config) {
            const { webhook } = config;
            this.webhook = webhook;
        }
    }
    /**
     * Registers events and starts the web servers for handling
     * webhooks.
     */
    start() {
        if (this.webhook) {
            this.webhookServer = new webhooks_1.WebhookServer(this.webhook);
        }
        for (const [event, tasks] of this.eventToTasks) {
            if (this.webhook && event instanceof event_1.events.WebhookEvent) {
                event.setWebhookServer(this.webhookServer);
            }
            for (const task of tasks) {
                event.register(task.exec);
            }
        }
        if (this.webhook) {
            this.webhookServer.start();
        }
        console.log('David started!');
    }
    /**
     * Adds event and task to David
     * @param eventOrChain Event associated with the task
     * @param task Task to run when this event is emitted
     * @returns instance of David
     */
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
}
exports.David = David;
