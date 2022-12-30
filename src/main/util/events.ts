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
listenForEvent(EventChannels.LoginForFarm, (event: LoginForFarmObject[]) => {
    createNotification(
        `${event[0].shown} login required`,
        `Login to farm is required for the ${event[0].shown} farm.`
    );

    sendOneWay(getMainWindow(), IpcChannels.farmLogin, {
        id: event[0].id,
        shown: event[0].shown,
        needed: event[0].needed
    });
});
