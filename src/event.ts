import { ethers } from "ethers";
import cron from 'node-cron';
import { TaskFn } from "./task";

type EventTrigger = "once" | "interval" | "cron" | "onchain-event";

interface EventConfigBase {
  startTime?: Date; 
  endTime?: Date;
}

abstract class Event {
  protected _startTime?: Date;
  protected _endTime?: Date;
  private _state: 'Created' | 'Registered' | 'Expired' = 'Created';

  /**
   * Registers the function to be executed onto corresponding event listeners.
   * If endTime is set, auto un-registers the function upon endTime.
   * 
   * @param exec 
   */
  public register(exec: TaskFn) {

    if (this.state !== 'Created') {
      // Task has already been registered / expired
      return;
    }

    const unregister = this._register(exec);
    this._state = 'Registered';

    if (this._endTime) {
      setTimeout(() => {
        unregister();
        this._state = 'Expired';
      }, this._endTime.getTime() - Date.now());
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

  public get startTime() {
    return this._startTime;
  }
  public get endTime() {
    return this._endTime;
  }
  public get state() {
    return this._state;
  }

  /**
   * Registers the function to be executed onto corresponding event listeners. 
   * 
   * @param exec The function to be executed upon trigger.
   */
  protected abstract _register(exec: TaskFn): UnregisterFn;
}

type OnceEventConfig = Omit<EventConfigBase, 'endTime'> | void;

class OnceEvent extends Event {
  constructor(config: OnceEventConfig) {
    super();
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

class IntervalEvent extends Event {
  public readonly interval: number;

  constructor({startTime, endTime, interval}: IntervalEventConfig) {
    super();
    this._startTime = startTime; 
    this._endTime = endTime; 
    this.interval = interval;
  }

  protected _register(exec: TaskFn): UnregisterFn {
    const interval = setInterval(exec, this.interval); 
    return () => clearInterval(interval);
  }
}

interface CronEventConfig extends EventConfigBase {
  cron: string;
}

class CronEvent extends Event {
  public readonly cron: string; 

  constructor({startTime, endTime, cron}: CronEventConfig) {
    super();
    this.cron = cron;
  }

  protected _register(exec: TaskFn): UnregisterFn {
    const cronTask = cron.schedule(this.cron, exec, {
      scheduled: !!this.startTime
    });
    if (this.startTime) {
      setTimeout(() => cronTask.start(), )
    }

    return () => {}
  }
}

interface OnchainEventConfig extends EventConfigBase {
  eventName: string; 
  contract: ethers.Contract;
}
class OnchainEvent {

}

export type EventConfig = OnceEventConfig | IntervalEventConfig | CronEventConfig | OnchainEventConfig;

type UnregisterFn = () => void;

const events = {

}

export default events;