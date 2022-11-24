"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("./task");
const event_1 = require("./event");
const david_1 = require("./david");
const david = {
    tasks: task_1.tasks, events: event_1.events, David: david_1.David
};
exports.default = david;
