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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.Task = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
// TESTS
const abi_json_1 = __importDefault(require("./abi.json"));
class Task {
    constructor(contractAddr, abi, provider, latestBlock) {
        this.queryChain = () => __awaiter(this, void 0, void 0, function* () {
            // Start listening to the blockchain
            let startingQueryBlock = this.latestBlock;
            let latestBlock = Math.min(yield (0, constants_1.getTestnetProvider)().getBlockNumber(), startingQueryBlock + constants_1.MAX_BLOCKS_READ);
            console.log(`reading from ${startingQueryBlock} to ${latestBlock}`);
            this.events.forEach((event) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.handleEvent(event, startingQueryBlock, latestBlock);
                }
                catch (e) {
                    console.error("block query error", e);
                }
            }));
            this.latestBlock = latestBlock;
            // let exampleEvent = await this.contract.queryFilter(
            //   "TokenERC721Mint", // TODO: This will be replaced by the event name
            //   startingQueryBlock + 1,
            //   latestBlock
            // );
        });
        this.contract = new ethers_1.ethers.Contract(contractAddr, abi, provider);
        this.latestBlock = latestBlock;
        this.events = [];
    }
    addEvent(event) {
        this.events.push(event);
    }
    handleEvent(event, startingQueryBlock, latestBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryEvent = yield this.contract.queryFilter(event.name, startingQueryBlock + 1, latestBlock);
            for (let i = 0; i < queryEvent.length; i++) {
                let eventData = queryEvent[i];
                // TODO: insert parsing of data here
                console.log("eventData", eventData);
                /*
                  let amount = eventData.args[0];
                  let tokenIds = eventData.args[1];
                  let timestamp = eventData.args[2];
                  let account = eventData.args[3];
                  let tokenData = eventData.args[4];
                  let mediaUri = eventData.args[5];
                */
                // TODO: handle
            }
        });
    }
    startTask() {
        // this.queryChain();
        setInterval(this.queryChain.bind(this), 1000);
    }
}
exports.Task = Task;
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
const newTask = new Task("0xA3b81CF9bf1D18C85C1Bf25d15361CF9A788BA3b", abi_json_1.default, (0, constants_1.getTestnetProvider)(), 7973272);
let testEvent = new Event("Deposit", new Date(), new Date(), 0, "");
newTask.addEvent(testEvent);
newTask.startTask();
