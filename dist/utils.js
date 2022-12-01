"use strict";
/**
 * Util functions and type definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
const ethers_1 = require("ethers");
class Contract {
    constructor(address, abi) {
        this.address = address;
        this.abi = abi;
    }
    toEthersContract(provider) {
        return new ethers_1.ethers.Contract(this.address, this.abi, provider);
    }
}
exports.Contract = Contract;
