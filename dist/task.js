"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = void 0;
const uuid_1 = require("uuid");
var tasks;
(function (tasks) {
    /**
     * Contain the task to be executed when an event is triggered.
     */
    class Task {
        constructor(name, exec) {
            this.name = name;
            this.id = (0, uuid_1.v4)();
            this.exec = (...args) => {
                try {
                    exec(...args);
                }
                catch (e) {
                    console.error(`Task id=${this.id} name=${this.name} failed with error:`);
                    console.error(e);
                }
            };
        }
    }
    tasks.Task = Task;
})(tasks = exports.tasks || (exports.tasks = {}));
