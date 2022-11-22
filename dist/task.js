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
exports.Task = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
class Task {
    constructor({ contractAddr, abi, provider, latestBlock }) {
        this.queryChain = () => __awaiter(this, void 0, void 0, function* () {
            // Start listening to the blockchain
            let startingQueryBlock = this.latestBlock;
            let latestBlock = Math.min(yield this.contract.provider.getBlockNumber(), startingQueryBlock + constants_1.MAX_BLOCKS_READ);
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
        this.latestBlock = latestBlock;
        this.abi = abi;
        this.provider = provider;
        this.contract = new ethers_1.ethers.Contract(contractAddr, abi, provider);
        this.events = [];
        provider.emit;
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
                yield event.handler(eventData);
            }
        });
    }
    start() {
        // this.queryChain();
        setInterval(this.queryChain, 1000);
    }
}
exports.Task = Task;
