"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(name, startTime, endTime, interval, desc, handler) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.interval = interval;
        this.desc = desc;
        this.handler = handler;
    }
}
exports.Event = Event;
