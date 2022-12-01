import { ethers } from "ethers";
import cron from 'node-cron';
import { v4 as uuidv4} from 'uuid';
import { Contract, EthersProvider } from "./utils";

import { TaskFn, tasks } from "./task";
import { timer } from "./timer";
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
  public register(task: tasks.Task) {
    const unregister = this._register(task);

    if (this._endTime) {
      timer.setTimeout(() => {
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
  protected abstract _register(task: tasks.Task): UnregisterFn;
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
  
    protected _register(task: tasks.Task): UnregisterFn {
      const exec = task.exec;
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
  
    protected _register(task: tasks.Task): UnregisterFn {
      const exec = task.exec;
      let timeout: timer.Timeout | null = null;
      if (this.startTime) {
        timeout = timer.setTimeout(() => {
          this.intervalTimer = setInterval(exec, this.interval);
        }, this.timeUntilStart());
      } else {
        this.intervalTimer = setInterval(exec, this.interval);
      }
      
      return () => {
        if (this.intervalTimer) {
          clearInterval(this.intervalTimer);
        } else if (timeout) {
          timer.clearTimeout(timeout);
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
  
    protected _register(task: tasks.Task): UnregisterFn {
      const exec = task.exec;
      const cronTask = cron.schedule(this.cron, exec, {
        scheduled: !!this.startTime
      });
      let timeout: timer.Timeout;
      if (this.startTime) {
        timeout = timer.setTimeout(() => cronTask.start(), this.timeUntilStart());
      }
  
      return () => {
        if (timeout) {
          timer.clearTimeout(timeout);
        } else {
          cronTask.stop();
        }
      }
    }
  }
  
  interface OnchainEventConfig extends EventConfigBase {
    providerName: string; 
    contract: Contract
    eventName: string; 
  }
  export class OnchainEvent extends Event {
  
    private contracts: ethers.Contract[] = [];
    /**
     * block number => (combId + txIndx) []
     */
    private eventRecords: Map<number, string[]> = new Map();
  
    constructor(private config: OnchainEventConfig) {
      super({startTime: config.startTime, endTime: config.endTime});
    }

    /**
     * Inject providers into the Event object.
     * @param providers 
     */
    public setProviders(providers: EthersProvider[]) {
      const { contract } = this.config;
      this.contracts = providers.map(provider => contract.toEthersContract(provider));
    }

    public get providerName(): string {
      return this.config.providerName;
    }
  
    protected _register(task: tasks.Task): UnregisterFn {
      const combineId = uuidv4(); 

      const exec = (...args: any[]) => {
        const chainEv: ethers.Event = args[args.length - 1];
        if (!this.eventAlreadyTriggered(chainEv, combineId)) {
          exec(args);
        }
      }

      for (const contract of this.contracts) {
        contract.on(this.config.eventName, exec);
      }

      return () => {
        for (const contract of this.contracts) {
          contract.removeListener(this.config.eventName, exec);
        }
      }
    }

    private eventAlreadyTriggered(event: ethers.Event, combId: string): boolean {
      const eventRecords = this.eventRecords.get(event.blockNumber);
      const eventIdentifier = `${combId}|${event.transactionIndex}`;

      if (!eventRecords) {
        // Add event to record
        this.eventRecords.set(event.blockNumber, [eventIdentifier]);

        // Remove oldest blocks to save memory
        if (this.eventRecords.size > 5) {
          const oldestBlockNumber = Math.min(...this.eventRecords.keys());
          this.eventRecords.delete(oldestBlockNumber);
        }
        return false;
      }

      for (const record of eventRecords) {
        if (record === eventIdentifier) {
          return true;
        }
      }
      return false;
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
  
    protected _register(task: tasks.Task): UnregisterFn {
      const exec = task.exec;
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
