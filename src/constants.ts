import { ethers } from "ethers";

export const getTestnetProvider = () =>
  new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/85f7b13fcd2b4b8fbfde6a4fbea02b6d");

export const MAX_BLOCKS_READ = 4998;