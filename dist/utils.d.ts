/**
 * Util functions and type definitions
 */
import { ethers } from "ethers";
export type address = string;
export type EthersProvider = ethers.providers.Provider;
export type EthersContract = ethers.Contract;
export declare class Contract {
    readonly address: string;
    readonly abi: ethers.ContractInterface;
    constructor(address: string, abi: ethers.ContractInterface);
    toEthersContract(provider: EthersProvider): EthersContract;
}
