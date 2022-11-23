import { EventChain, Event, events } from './event';

import { tasks } from './task';
import { WebhookServer, WebhookConfig } from './webhooks';

interface DavidConfig {
  /**
   * When provided, David will start a http server to listen to webhook events. 
   */
  webhook?: WebhookConfig;
}

/**
 * A class responsible for managing global tasks and events.
 * It's recommanded to have only one instance of David exist at a time.
 */
export class David {

  private webhook?: WebhookConfig;
  private webhookServer?: WebhookServer;
  private tasks: tasks.Task[] = [];
  private eventToTasks: Map<Event, tasks.Task[]> = new Map();

  constructor(config?: DavidConfig) {
    if (config) {
      const {webhook} = config;
      this.webhook = webhook;
    }
  }

  public start() {
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
      (<WebhookServer>this.webhookServer).start();
    }
    console.log('David started!')
  }

  public on(eventOrChain: Event | EventChain, task: tasks.Task) {
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
    }

    return this;
  }

}

