import cron from 'node-cron';

export namespace timer {

  export type Timeout = number;

  let timeoutCount = 0;
  const timeouts: Map<Timeout, Timer> = new Map();
  const MAX_TIMEOUT_MS = Math.pow(2, 31);

  export const cronStringFromDate = (date: Date) => 
    `${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} ${date.getDay()}`;

  /**
   * setTimeout provided by Node.js can only delay uptil 24.8 days (see https://stackoverflow.com/a/53280339/15405467). 
   * For longer delay times, we have to use cron jobs. 
   * This function aggregates the two methods into an interface similar to the native setTimeout function. 
   * 
   * Flaw: If the awaited time is larger than MAX_TIMEOUT_MS, then the timeout will only be accurate upto seconds and not miliseconds due to the limitations of cron jobs. 
   * @param ms 
   * @param fn 
   * @param args 
   * @returns Timeout
   */
  export const setTimeout = (fn: CallableFunction, ms: number,  ...args: any[]): Timeout => {

    const timeout = timeoutCount ++;
    let timer: Timer;

    if (ms > MAX_TIMEOUT_MS) {
      // Use cron task
      const triggerDate = new Date(Date.now() + ms);
      const cronTask = cron.schedule(cronStringFromDate(triggerDate), () => {
        fn(args);
      })
      timer = new CronTimeout(cronTask);
    } else {
      // Use regualr Node.js setTimeout
      timer = new NodeJSTimeout(nodejsSetTimeout(fn, ms, args));
    }

    timeouts.set(timeout, timer);

    return timeout;
  }

  /**
   * Clear a timeout.
   * @param timeout The timeout to be cleared
   */
  export const clearTimeout = (timeout: Timeout) => {
    timeouts.get(timeout)?.clear();
  }
}

abstract class Timer {
  constructor() {}

  public abstract clear(): void;
}
class NodeJSTimeout extends Timer {
  constructor(
    private readonly nodeTimeout: NodeJS.Timeout | number
  ) {
    super();
  }

  public clear(): void {
    clearTimeout(this.nodeTimeout);
  }
}
class CronTimeout extends Timer {
  constructor(
    private readonly cronTask: cron.ScheduledTask
  ) {
    super();
  }

  public clear(): void {
    this.cronTask.stop();
  }
}
const nodejsSetTimeout = setTimeout;