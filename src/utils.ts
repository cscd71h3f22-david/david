/**
 * Util functions and type definitions
 */

import { ethers } from "ethers";

export type address = string;
export type EthersProvider = ethers.providers.Provider;
export type EthersContract = ethers.Contract;

export class Contract {
  constructor(
    public readonly address: string,
    public readonly abi: ethers.ContractInterface,
  ) {}

  public toEthersContract(provider: EthersProvider): EthersContract {
    return new ethers.Contract(
      this.address, this.abi, provider
    );
  }
}