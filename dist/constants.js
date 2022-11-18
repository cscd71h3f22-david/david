"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_BLOCKS_READ = exports.getTestnetProvider = void 0;
const ethers_1 = require("ethers");
const getTestnetProvider = () => new ethers_1.ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/85f7b13fcd2b4b8fbfde6a4fbea02b6d");
exports.getTestnetProvider = getTestnetProvider;
exports.MAX_BLOCKS_READ = 4998;
