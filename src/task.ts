import { ethers } from 'ethers';
import {v4 as uuidv4} from 'uuid';

export type TaskFn = <T extends any[]>(...args: T) => void;

export namespace tasks {
  
  /**
   * Contain the task to be executed when an event is triggered.
   */
  export class Task {
    public readonly id = uuidv4(); 
    public readonly exec: TaskFn;

    constructor(
      public readonly name: string,
      exec: TaskFn,
    ) {
      this.exec = (...args: any[]) => {
        try {
          exec(...args);
        } catch (e) {
          console.error(`Task id=${this.id} name=${this.name} failed with error:`);
          console.error(e);
        }
      }
    }
  }

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
}