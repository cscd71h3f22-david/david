import uuid from 'uuid';

export type TaskFn = () => void;

export namespace tasks {
  
  /**
   * Contain the task to be executed when an event is triggered.
   */
  export class Task {
    public readonly id = uuid.v4(); 
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