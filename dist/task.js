"use strict";
// import { ethers } from "ethers";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = void 0;
var tasks;
(function (tasks) {
    /**
     * Contain the task to be executed when an event is triggered.
     */
    class Task {
        constructor(name, exec) {
            this.name = name;
            this.exec = () => {
                try {
                    exec();
                }
                catch (e) {
                    console.error(`Task ${this.name} failed with error:`);
                    console.error(e);
                }
            };
        }
    }
    tasks.Task = Task;
})(tasks = exports.tasks || (exports.tasks = {}));
