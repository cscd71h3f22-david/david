import {v4 as uuidv4} from 'uuid';

export type TaskFn = () => void;

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
      this.exec = () => {
        try {
          exec();
        } catch (e) {
          console.error(`Task id=${this.id} name=${this.name} failed with error:`);
          console.error(e);
        }
      }
    }
  }
}