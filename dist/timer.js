"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timer = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
var timer;
(function (timer_1) {
    let timeoutCount = 0;
    const timeouts = new Map();
    const MAX_TIMEOUT_MS = Math.pow(2, 31);
    timer_1.cronStringFromDate = (date) => `${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} ${date.getDay()}`;
    /**
     * setTimeout provided by Node.js can only delay uptil 24.8 days (see https://stackoverflow.com/a/53280339/15405467).
     * For longer delay times, we have to use cron jobs.
     * This function aggregates the two methods into an interface similar to the native setTimeout function.
     *
     * Flaw: If the awaited time is larger than MAX_TIMEOUT_MS, then the timeout will only be accurate upto seconds and not miliseconds due to the limitations of cron jobs.
     * @param ms
     * @param fn
     * @param args
     * @returns Timeout
     */
    timer_1.setTimeout = (fn, ms, ...args) => {
        const timeout = timeoutCount++;
        let timer;
        if (ms > MAX_TIMEOUT_MS) {
            // Use cron task
            const triggerDate = new Date(Date.now() + ms);
            const cronTask = node_cron_1.default.schedule(timer_1.cronStringFromDate(triggerDate), () => {
                fn(args);
            });
            timer = new CronTimeout(cronTask);
        }
        else {
            // Use regualr Node.js setTimeout
            timer = new NodeJSTimeout(nodejsSetTimeout(fn, ms, args));
        }
        timeouts.set(timeout, timer);
        return timeout;
    };
    /**
     * Clear a timeout.
     * @param timeout The timeout to be cleared
     */
    timer_1.clearTimeout = (timeout) => {
        var _a;
        (_a = timeouts.get(timeout)) === null || _a === void 0 ? void 0 : _a.clear();
    };
})(timer = exports.timer || (exports.timer = {}));
class Timer {
    constructor() { }
}
class NodeJSTimeout extends Timer {
    constructor(nodeTimeout) {
        super();
        this.nodeTimeout = nodeTimeout;
    }
    clear() {
        clearTimeout(this.nodeTimeout);
    }
}
class CronTimeout extends Timer {
    constructor(cronTask) {
        super();
        this.cronTask = cronTask;
    }
    clear() {
        this.cronTask.stop();
    }
}
const nodejsSetTimeout = setTimeout;
