import { EventEmitter } from 'events';
import { EventChannels, IpcChannels } from '../common/constants';
import { sendOneWay } from '../electron/ipc';
import { getMainWindow } from '../electron/windows';
import { createNotification } from './notifications';

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

/**
 * Events.
 */
listenForEvent(EventChannels.LoginForFarm, (event: LoginForFarmObject) => {
    sendOneWay(getMainWindow(), IpcChannels.farmLogin, {
        id: event.id,
        shown: event.shown,
        needed: event.needed
    });
    createNotification(
        `${event.shown} login required`,
        `Login to farm is required for the ${event.shown} farm.`
    );
});
