import { EventEmitter } from 'events';
import { EventChannels } from '../common/constants';

const em = new EventEmitter();

export function emitEvent(eventChannel: EventChannels, ...args: any[]) {
    em.emit(eventChannel, args);
}

export function listenForEvent(
    eventChannel: EventChannels,
    onEvent: (...args: any[]) => void
) {
    em.on(eventChannel, onEvent);
}
