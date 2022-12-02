"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            this.exec = (...args) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield exec(...args);
                }
                catch (e) {
                    console.error(`Task id=${this.id} name=${this.name} failed with error:`);
                    console.error(e);
                }
            });
        }
    }
    tasks.Task = Task;
    // interface ContractTaskConfig {
    //   name: string;
    // }
    // export class ContractTask extends Task {
    //   constructor(
    //     name: string,
    //     signer: ethers.Signer,
    //     contractAddr: string,
    //     methodName: string, 
    //     ...args: any[]
    //   ) {
    //     const exec = async () => {
    //     }
    //     super(name, exec);
    //   }
    // }
})(tasks = exports.tasks || (exports.tasks = {}));
