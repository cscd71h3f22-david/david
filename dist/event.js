"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEvent = exports.events = exports.EventChain = exports.Event = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
/**
 * Contain the logic of when to call a task function.
 */
class Event {
    constructor(config) {
        this._startTime = config.startTime;
        this._endTime = config.endTime;
    }
    /**
     * Register the task function onto corresponding event listeners.
     * If endTime is set, auto un-registers the function upon endTime.
     *
     * @param exec
     */
    register(exec) {
        const unregister = this._register(exec);
        if (this._endTime) {
            setTimeout(() => {
                unregister();
            }, this.timeUntilEnd());
        }
    }
    /**
     * @returns time (in ms) until the event started. 0 if the event has already started.
     */
    timeUntilStart() {
        if (!this.startTime) {
            return 0;
        }
        const diff = this.startTime.getTime() - Date.now();
        return diff > 0 ? diff : 0;
    }
    /**
     * @returns time (in ms) until the event ended. 0 if the event has already ended. +inf if the event lasts forever.
     */
    timeUntilEnd() {
        if (!this.endTime) {
            return Number.POSITIVE_INFINITY;
        }
        const diff = this.endTime.getTime() - Date.now();
        return diff > 0 ? diff : 0;
    }
    and(event) {
        return new EventChain().and(this).and(event);
    }
    get startTime() {
        return this._startTime;
    }
    get endTime() {
        return this._endTime;
    }
}
exports.Event = Event;
/**
 * Allows the user to chain events together using .or()
 */
class EventChain {
    constructor() {
        this.events = [];
    }
    and(event) {
        this.events.push(event);
        return this;
    }
}
exports.EventChain = EventChain;
/**
 * Different types of events
 */
var events;
(function (events) {
    class OnceEvent extends Event {
        constructor(config) {
            super(config || {});
            if (config && config.startTime) {
                this._startTime = config.startTime;
            }
        }
        _register(exec) {
            if (this.startTime) {
                setTimeout(exec, this.timeUntilStart());
            }
            else {
                exec();
            }
            return () => { };
        }
    }
    events.OnceEvent = OnceEvent;
    class IntervalEvent extends Event {
        constructor({ startTime, endTime, interval }) {
            super({ startTime, endTime });
            this.intervalTimer = null;
            this._startTime = startTime;
            this._endTime = endTime;
            this.interval = interval;
        }
        _register(exec) {
            let timeout = null;
            if (this.startTime) {
                timeout = setTimeout(() => {
                    this.intervalTimer = setInterval(exec, this.interval);
                }, this.timeUntilStart());
            }
            return () => {
                if (this.intervalTimer) {
                    clearInterval(this.intervalTimer);
                }
                else if (timeout) {
                    clearTimeout(timeout);
                }
            };
        }
    }
    events.IntervalEvent = IntervalEvent;
    class CronEvent extends Event {
        constructor({ startTime, endTime, cron }) {
            super({ startTime, endTime });
            this.cron = cron;
        }
        _register(exec) {
            const cronTask = node_cron_1.default.schedule(this.cron, exec, {
                scheduled: !!this.startTime
            });
            let timeout;
            if (this.startTime) {
                timeout = setTimeout(() => cronTask.start(), this.timeUntilStart());
            }
            return () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                else {
                    cronTask.stop();
                }
            };
        }
    }
    events.CronEvent = CronEvent;
    class OnchainEvent extends Event {
        constructor({ contract, eventName, startTime, endTime }) {
            super({ startTime, endTime });
            this.contract = contract;
            this.eventName = eventName;
        }
        _register(exec) {
            this.contract.on(this.eventName, exec);
            return () => {
                this.contract.removeListener(this.eventName, exec);
            };
        }
    }
    events.OnchainEvent = OnchainEvent;
})(events = exports.events || (exports.events = {}));
class WebhookEvent extends Event {
    constructor({ eventName, startTime, endTime }) {
        super({ startTime, endTime });
        this.webhookServer = undefined;
        this.name = eventName;
    }
    setWebhookServer(webhookServer) {
        this.webhookServer = webhookServer;
    }
    _register(exec) {
        if (!this.webhookServer) {
            throw 'Webhook Server not initialized yet.';
        }
        this.webhookServer.registerEvent(this.name, exec);
        return () => {
            this.webhookServer.removeEvent(this.name);
        };
    }
}
exports.WebhookEvent = WebhookEvent;
