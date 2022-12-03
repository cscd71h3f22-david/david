"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = exports.EventChain = exports.Event = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const uuid_1 = require("uuid");
const timer_1 = require("./timer");
/**
 * Contain the logic of when to call a task function.
 */
class Event {
    constructor(config) {
        this.id = (0, uuid_1.v4)();
        this._startTime = config.startTime;
        this._endTime = config.endTime;
    }
    /**
     * Register the task function onto corresponding event listeners.
     * If endTime is set, auto un-registers the function upon endTime.
     *
     * @param exec
     */
    register(task) {
        const unregister = this._register(task);
        if (this._endTime) {
            timer_1.timer.setTimeout(() => {
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
        _register(task) {
            const exec = task.exec;
            if (this.startTime) {
                timer_1.timer.setTimeout(exec, this.timeUntilStart());
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
        _register(task) {
            const exec = task.exec;
            let timeout = null;
            if (this.startTime) {
                timeout = timer_1.timer.setTimeout(() => {
                    this.intervalTimer = setInterval(exec, this.interval);
                }, this.timeUntilStart());
            }
            else {
                this.intervalTimer = setInterval(exec, this.interval);
            }
            return () => {
                if (this.intervalTimer) {
                    clearInterval(this.intervalTimer);
                }
                else if (timeout) {
                    timer_1.timer.clearTimeout(timeout);
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
        _register(task) {
            const exec = task.exec;
            const cronTask = node_cron_1.default.schedule(this.cron, exec, {
                scheduled: !!this.startTime
            });
            let timeout;
            if (this.startTime) {
                timeout = timer_1.timer.setTimeout(() => cronTask.start(), this.timeUntilStart());
            }
            return () => {
                if (timeout) {
                    timer_1.timer.clearTimeout(timeout);
                }
                else {
                    cronTask.stop();
                }
            };
        }
    }
    events.CronEvent = CronEvent;
    class OnchainEvent extends Event {
        constructor(config) {
            super({ startTime: config.startTime, endTime: config.endTime });
            this.config = config;
            this.contracts = [];
            /**
             * block number => (combId + txIndx) []
             */
            this.eventRecords = new Map();
        }
        /**
         * Inject providers into the Event object.
         * @param providers
         */
        setProviders(providers) {
            const { contract } = this.config;
            this.contracts = providers.map(provider => contract.toEthersContract(provider));
        }
        get providerName() {
            return this.config.providerName;
        }
        _register(task) {
            const combineId = (0, uuid_1.v4)();
            const exec = (...args) => {
                const chainEv = args[args.length - 1];
                if (!this.eventAlreadyTriggered(chainEv, combineId)) {
                    task.exec(...args);
                }
            };
            for (const contract of this.contracts) {
                contract.on(this.config.eventName, exec);
            }
            return () => {
                for (const contract of this.contracts) {
                    contract.removeListener(this.config.eventName, exec);
                }
            };
        }
        eventAlreadyTriggered(event, combId) {
            const eventRecords = this.eventRecords.get(event.blockNumber);
            const eventIdentifier = `${combId}|${event.transactionHash}|${event.logIndex}`;
            if (!eventRecords) {
                // Add event to record
                this.eventRecords.set(event.blockNumber, [eventIdentifier]);
                // Remove oldest blocks to save memory
                if (this.eventRecords.size > 5) {
                    const oldestBlockNumber = Math.min(...this.eventRecords.keys());
                    this.eventRecords.delete(oldestBlockNumber);
                }
                return false;
            }
            for (const record of eventRecords) {
                if (record === eventIdentifier) {
                    return true;
                }
            }
            return false;
        }
    }
    events.OnchainEvent = OnchainEvent;
    class WebhookEvent extends Event {
        constructor({ eventName, startTime, endTime, verifier, path, method }) {
            super({ startTime, endTime });
            this.webhookServer = undefined;
            this.name = eventName;
            this.verifier = verifier;
            this.path = path;
            this.method = method;
        }
        setWebhookServer(webhookServer) {
            this.webhookServer = webhookServer;
        }
        _register(task) {
            const exec = task.exec;
            if (!this.webhookServer) {
                throw 'Webhook Server not initialized yet.';
            }
            this.webhookServer.registerEvent(this, exec);
            return () => {
                var _a;
                (_a = this.webhookServer) === null || _a === void 0 ? void 0 : _a.removeEvent(this);
            };
        }
    }
    events.WebhookEvent = WebhookEvent;
})(events = exports.events || (exports.events = {}));
