export declare namespace utils {
    type Timeout = number;
    const cronStringFromDate: (date: Date) => string;
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
    const setTimeout: (fn: CallableFunction, ms: number, ...args: any[]) => Timeout;
    /**
     * Clear a timeout.
     * @param timeout The timeout to be cleared
     */
    const clearTimeout: (timeout: Timeout) => void;
}
