import { EventEmitter } from 'events';
import { EventChannels } from '../common/constants';

const em = new EventEmitter();

/**
 * Emit a main process only event.
 */
export function emitEvent(eventChannel: EventChannels, ...args: any[]) {
    em.emit(eventChannel, args);
}

/**
 * Listen for a main process only event.
 */
export function listenForEvent(
    eventChannel: EventChannels,
    onEvent: (...args: any[]) => void
) {
    em.on(eventChannel, onEvent);
}
