"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.Task = void 0;
class Task {
    constructor(contract, abi) {
        this.contract = contract;
        this.abi = abi;
        this.events = [];
    }
    addEvent(event) {
        // TODO
    }
    startTask() {
        // TODO -- run all events
    }
}
exports.Task = Task;
class Event {
    constructor(startTime, endTime, interval, desc) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.interval = interval;
        this.desc = desc;
    }
}
exports.Event = Event;
// let bingo = new Task(,);
