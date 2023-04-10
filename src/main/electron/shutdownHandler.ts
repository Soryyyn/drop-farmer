import { log } from '@main/util/logging';
import ElectronShutdownHandler from '@paymoapp/electron-shutdown-handler';
import { handleAppBeforeQuit } from './appEvents';
import { getMainWindowNativeHandle } from './windows';

/**
 * Handle the client shutdown to firstly gracefully quit the app.
 */
export function handleClientShutdown(): void {
    ElectronShutdownHandler.setWindowHandle(getMainWindowNativeHandle());
    ElectronShutdownHandler.blockShutdown('Please wait for graceful shutdown');

    ElectronShutdownHandler.on('shutdown', () => {
        log('info', 'Received shutdown event, gracefully quitting app');
        handleAppBeforeQuit();
    });

    log('info', 'Handling shutdown of client');
}
