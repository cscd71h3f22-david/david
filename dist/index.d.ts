import { tasks } from './task';
import { events } from './event';
import { David } from './david';
declare const david: {
    tasks: typeof tasks;
    events: typeof events;
    David: typeof David;
};
export default david;
