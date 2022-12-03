import { tasks } from './task';
import { events } from './event';
import { David } from './david';
import { Contract } from './utils';
declare const david: {
    tasks: typeof tasks;
    events: typeof events;
    David: typeof David;
    Contract: typeof Contract;
};
export default david;
