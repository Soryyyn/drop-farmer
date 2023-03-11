import { log } from '@main/util/logging';
import { app } from 'electron';

/**
 * Request a single instance lock for the app.
 * Return if the app is holding the current lock.
 */
export function requestSingleInstanceLock(): boolean {
    log('info', 'Requested single instance lock');
    return app.requestSingleInstanceLock();
}

/**
 * If the app has its instance locked.
 */
export function hasInstanceLocked(): boolean {
    return app.hasSingleInstanceLock();
}
