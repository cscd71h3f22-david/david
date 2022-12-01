import { ethers } from "ethers";
import cron from 'node-cron';
import { v4 as uuidv4} from 'uuid';

import { TaskFn } from "./task";
import { utils } from "./util";
import { WebhookServer, WebhookVerifier } from "./webhooks";


type UnregisterFn = () => void;
type EventTrigger = "once" | "interval" | "cron" | "onchain-event";
type OnceEventConfig = Omit<EventConfigBase, 'endTime'> | void;

interface EventConfigBase {
  startTime?: Date; 
  endTime?: Date;
}

/**
 * Contain the logic of when to call a task function.
 */
export abstract class Event {
  public readonly id = uuidv4();
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
      utils.setTimeout(() => {
        unregister();
      }, this.timeUntilEnd());
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

/**
 * Different types of events
 */
export namespace events {
  export class OnceEvent extends Event {
    constructor(config: OnceEventConfig) {
      super(config || {});
      if (config && config.startTime) {
        this._startTime = config.startTime; 
      }
    }
  
    protected _register(exec: TaskFn): UnregisterFn {
      if (this.startTime) {
        utils.setTimeout(exec, this.timeUntilStart());
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
      let timeout: utils.Timeout | null = null;
      const createInterval = () => {
        this.intervalTimer = setInterval(exec, this.interval);
      }

      if (this.startTime) {
        timeout = utils.setTimeout(createInterval, this.timeUntilStart());
      } else {
        createInterval();
      }
      
      return () => {
        if (this.intervalTimer) {
          clearInterval(this.intervalTimer);
        } else if (timeout) {
          utils.clearTimeout(timeout);
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
      let timeout: utils.Timeout;
      if (this.startTime) {
        timeout = utils.setTimeout(() => cronTask.start(), this.timeUntilStart());
      }
  
      return () => {
        if (timeout) {
          utils.clearTimeout(timeout);
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

  interface WebhookEventConfig extends EventConfigBase {
    eventName: string;
    verifier: WebhookVerifier;
    path: string;
    method: string;
  }
  
  export class WebhookEvent extends Event {
    public webhookServer: WebhookServer | undefined = undefined;
    public readonly name: string;
    public readonly verifier: WebhookVerifier;
    public readonly path: string;
    public readonly method: string;

    constructor({eventName, startTime, endTime, verifier, path, method}: WebhookEventConfig) {
      super({startTime, endTime});
      this.name = eventName;
      this.verifier = verifier;
      this.path = path;
      this.method = method;
    }
  
    public setWebhookServer(webhookServer: WebhookServer) {
      this.webhookServer = webhookServer;
    }
  
    protected _register(exec: TaskFn): UnregisterFn {
      if (!this.webhookServer) {
        throw 'Webhook Server not initialized yet.'
      }
      this.webhookServer.registerEvent(this, exec)
      return () => {
        this.webhookServer?.removeEvent(this);
      }
    }
  }
  
  
  export type EventConfig = OnceEventConfig | IntervalEventConfig | CronEventConfig | OnchainEventConfig;
}
