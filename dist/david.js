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
        this.eventToTasks = new Map();
        this.providers = new Map();
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
        var _a;
        if (this.webhook) {
            this.webhookServer = new webhooks_1.WebhookServer(this.webhook);
        }
        for (const [event, tasks] of this.eventToTasks) {
            if (this.webhook && event instanceof event_1.events.WebhookEvent) {
                event.setWebhookServer(this.webhookServer);
            }
            else if (event instanceof event_1.events.OnchainEvent) {
                const providerName = event.providerName;
                const eventProviders = this.providers.get(providerName);
                if (eventProviders === undefined) {
                    throw new Error(`Provider named ${providerName} doesn't exist. Please register your providers using David.registerProvider().`);
                }
                event.setProviders(eventProviders);
            }
            for (const task of tasks) {
                event.register(task);
            }
        }
        if (this.webhook) {
            (_a = this.webhookServer) === null || _a === void 0 ? void 0 : _a.start();
        }
        console.log('David started!');
    }
    /**
     * Adds event and task to David
     * @param eventOrChain Event associated with the task
     * @param task Task to run when this event is emitted
     * @returns the David Object
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
        else if (eventOrChain instanceof Array) {
            // First parameter is Event[]
            for (const event of eventOrChain) {
                this.on(event, task);
            }
        }
        return this;
    }
    registerProvider(name, providers) {
        providers = providers instanceof Array ? providers : [providers];
        if (this.providers.has(name)) {
            providers = this.providers.get(name).concat(providers);
            this.providers.set(name, providers);
        }
        else {
            this.providers.set(name, providers);
        }
        return this;
    }
}
exports.David = David;
