import { ethers } from "ethers";
import cron from 'node-cron';
import { TaskFn } from "./task";


type UnregisterFn = () => void;

interface EventConfigBase {
  startTime?: Date; 
  endTime?: Date;
}

/**
 * Contain the logic of when to call a task function.
 */
export abstract class Event {
  protected _startTime?: Date;
  protected _endTime?: Date;

  constructor(config: EventConfigBase) {
    this._startTime = config.startTime;
    this._endTime = config.endTime;
  }

  /**
   * Register the task function onto corresponding event listeners.
   * If endTime is set, auto un-registers the function upon endTime.
   * 
   * @param exec 
   */
  public register(exec: TaskFn) {

    const unregister = this._register(exec);

    if (this._endTime) {
      setTimeout(() => {
        unregister();
      }, this._endTime.getTime() - Date.now());
      console.log('set time out')
    }
  }

  /**
   * @returns time (in ms) until the event started. 0 if the event has already started. 
   */
  public timeUntilStart() {
    if (!this.startTime) {
      return 0;
    }
    const diff = this.startTime.getTime() - Date.now();
    return diff > 0 ? diff : 0;
  }

  /**
   * @returns time (in ms) until the event ended. 0 if the event has already ended. +inf if the event lasts forever.
   */
  public timeUntilEnd() {
    if (!this.endTime) {
      return Number.POSITIVE_INFINITY;
    }
    const diff = this.endTime.getTime() - Date.now();
    return diff > 0 ? diff : 0;
  }

  public and(event: Event): EventChain {
    return new EventChain().and(this).and(event);
  }

  public get startTime() {
    return this._startTime;
  }
  public get endTime() {
    return this._endTime;
  }

  /**
   * Registers the function to be executed onto corresponding event listeners. 
   * 
   * @param exec The function to be executed upon trigger.
   * @returns UnregisterFn: A function to be called at this.endTime. 
   */
  protected abstract _register(exec: TaskFn): UnregisterFn;
}

/**
 * Allows the user to chain events together using .or()
 */
export class EventChain {
  public readonly events: Event[] = [];

  constructor() {}

  public and(event: Event): EventChain {

    this.events.push(event);

    return this;
  }
}

export namespace events {
  type EventTrigger = "once" | "interval" | "cron" | "onchain-event";
  
  
  
  type OnceEventConfig = Omit<EventConfigBase, 'endTime'> | void;
  
  export class OnceEvent extends Event {
    constructor(config: OnceEventConfig) {
      super(config || {});
      if (config && config.startTime) {
        this._startTime = config.startTime; 
      }
    }
  
    protected _register(exec: TaskFn): UnregisterFn {
      if (this.startTime) {
        setTimeout(exec, this.timeUntilStart())
      } else {
        exec();
      }
      
      return () => {}
    }
  }
  
  interface IntervalEventConfig extends EventConfigBase {
    interval: number
  }
  
  export class IntervalEvent extends Event {
    public readonly interval: number;
    private intervalTimer: NodeJS.Timer | null = null;
  
    constructor({startTime, endTime, interval}: IntervalEventConfig) {
      super({startTime, endTime});
      this._startTime = startTime; 
      this._endTime = endTime; 
      this.interval = interval;
    }
  
    protected _register(exec: TaskFn): UnregisterFn {
      let timeout: NodeJS.Timeout | null = null;
      if (this.startTime) {
        timeout = setTimeout(() => {
          this.intervalTimer = setInterval(exec, this.interval);
        }, this.timeUntilStart());
      }
      
      return () => {
        if (this.intervalTimer) {
          clearInterval(this.intervalTimer);
        } else if (timeout) {
          clearTimeout(timeout);
        }
      }
    }
  }
  
  interface CronEventConfig extends EventConfigBase {
    cron: string;
  }
  
  export class CronEvent extends Event {
    public readonly cron: string; 
  
    constructor({startTime, endTime, cron}: CronEventConfig) {
      super({startTime, endTime});
      this.cron = cron;
    }
  
    protected _register(exec: TaskFn): UnregisterFn {
      const cronTask = cron.schedule(this.cron, exec, {
        scheduled: !!this.startTime
      });
      let timeout: NodeJS.Timeout;
      if (this.startTime) {
        timeout = setTimeout(() => cronTask.start(), this.timeUntilStart());
      }
  
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        } else {
          cronTask.stop();
        }
      }
    }
  }
  
  interface OnchainEventConfig extends EventConfigBase {
    eventName: string; 
    contract: ethers.Contract;
  }
  export class OnchainEvent extends Event {
  
    public readonly contract: ethers.Contract;
    public readonly eventName: string;
  
    constructor({contract, eventName, startTime, endTime}: OnchainEventConfig) {
      super({startTime, endTime});
      this.contract = contract; 
      this.eventName = eventName;
    }
  
    protected _register(exec: TaskFn): UnregisterFn {

      this.contract.on(this.eventName, exec);

      return () => {
        this.contract.removeListener(this.eventName, exec);
      }
    }
  }
  
  export type EventConfig = OnceEventConfig | IntervalEventConfig | CronEventConfig | OnchainEventConfig;
}