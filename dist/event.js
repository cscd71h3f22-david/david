"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(name, startTime, endTime, interval, desc) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.interval = interval;
        this.desc = desc;
    }
}
exports.Event = Event;
