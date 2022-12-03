export type TaskFn = <T extends any[]>(...args: T) => void | Promise<void>;
export declare namespace tasks {
    /**
     * Contain the task to be executed when an event is triggered.
     */
    class Task {
        readonly name: string;
        readonly id: string;
        readonly exec: TaskFn;
        constructor(name: string, exec: TaskFn);
    }
}
