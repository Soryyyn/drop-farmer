import { app } from 'electron';
import { LogLevel, log } from '../util/logging';

/**
 * Check if the app is the primary instance (the only instance which should be running)
 */
export function isPrimaryInstance() {
    log(LogLevel.Info, 'Requested single instance lock');
    return app.requestSingleInstanceLock();
}
