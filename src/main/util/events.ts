import { EventChannel } from '@main/common/constants';
import { EventEmitter } from 'events';

const em = new EventEmitter();

/**
 * Emit a main process only event.
 */
export function emitEvent(eventChannel: EventChannel, ...args: any[]) {
    em.emit(eventChannel, args);
}

/**
 * Listen for a main process only event.
 */
export function listenForEvent(
    eventChannel: EventChannel,
    onEvent: (...args: any[]) => void
) {
    em.on(eventChannel, onEvent);
}
