import { ethers } from 'ethers';
import { EventChain, Event, events } from './event';

import { tasks } from './task';
import { WebhookServer, WebhookConfig } from './webhooks';

interface DavidConfig {
  /**
   * When provided, David will start a http server to listen to webhook events. 
   */
  webhook?: WebhookConfig;
}

type EthersProvider = ethers.providers.Provider;

/**
 * A class responsible for managing global tasks and events.
 * It's recommanded to have only one instance of David exist at a time.
 */
export class David {

  private webhook?: WebhookConfig;
  private webhookServer?: WebhookServer;
  private eventToTasks: Map<Event, tasks.Task[]> = new Map();

  private providers: Map<string, EthersProvider[]> = new Map();

  /**
   * Creates an instance of David
   * @param config configuration settings for David
   */
  constructor(config?: DavidConfig) {
    if (config) {
      const {webhook} = config;
      this.webhook = webhook;
    }
  }

  /**
   * Registers events and starts the web servers for handling
   * webhooks.
   */
  public start(): void {
    if (this.webhook) {
      this.webhookServer = new WebhookServer(this.webhook);
    }
    for (const [event, tasks] of this.eventToTasks) {
      if (this.webhook && event instanceof events.WebhookEvent) {
        event.setWebhookServer(<WebhookServer>this.webhookServer);
      }
      for (const task of tasks) {
        event.register(task.exec);
      }
    }
    if (this.webhook) {
      this.webhookServer?.start();
    }
    console.log('David started!')
  }

  /**
   * Adds event and task to David
   * @param eventOrChain Event associated with the task
   * @param task Task to run when this event is emitted
   * @returns the David Object
   */
  public on(eventOrChain: Event | EventChain | Event[], task: tasks.Task): David {
    if (eventOrChain instanceof Event) {
      // First parameter is an event
      let event = eventOrChain;
      if (this.eventToTasks.has(event)) {
        this.eventToTasks.get(event)!.push(task);
      } else {
        this.eventToTasks.set(event, [task]);
      }
    } else if (eventOrChain instanceof EventChain) {
      // First parameter is an event chain
      let events = eventOrChain.events; 
      for (const event of events) {
        this.on(event, task);
      }
    } else if (eventOrChain instanceof Array) {
      // First parameter is Event[]
      for (const event of eventOrChain) {
        this.on(event, task);
      }
    }

    return this;
  }

  /**
   * 
   * @param name name of provider
   * @param providers ethers provider or list of ether providers.
   * @returns the David object
   */
  public registerProvider(name: string, providers: EthersProvider): David;
  public registerProvider(name: string, providers: EthersProvider[]): David;

  public registerProvider(name: string, providers: EthersProvider | EthersProvider[]): David {
    providers = providers instanceof Array ? providers: [providers];

    if (this.providers.has(name)) {
      providers = this.providers.get(name)!.concat(providers);
      this.providers.set(name, providers);
    } else {
      this.providers.set(name, providers);
    }

    return this;
  }

}

