import http from 'http';
import { EventChain, Event } from './event';

import { tasks } from './task';

interface WebhookConfig {
  /**
   * Port of the webhook listener server.
   * Defaults to 5000.
   */
  port?: number;
}
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

  private tasks: tasks.Task[] = [];
  private eventToTasks: Map<Event, tasks.Task[]> = new Map();

  constructor(config?: DavidConfig) {
    if (config) {
      const {webhook} = config;
      this.webhook = webhook;
    }
  }

  public start() {
    console.log('David started!')
    for (const [event, tasks] of this.eventToTasks) {
      for (const task of tasks) {
        event.register(task.exec);
      }
    }
    
    if (this.webhook) {
      this.startHTTPServer();
    }
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

  private startHTTPServer() {
    const server = new http.Server((req, res) => {

      // TODO: Figure out how to implement webhook event listener. How much freedom do we want to give our users.

    });
  }

}
