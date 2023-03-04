import { stopFarms } from '@main/farming/management';
import { log } from '@main/util/logging';
import ElectronShutdownHandler from '@paymoapp/electron-shutdown-handler';
import { app } from 'electron';
import { destroyTray } from './tray';
import { getMainWindow, setAppQuitting } from './windows';

/**
 * Handle the client shutdown to firstly gracefully quit the app.
 */
export function handleClientShutdown(): void {
    ElectronShutdownHandler.setWindowHandle(
        getMainWindow().getNativeWindowHandle()
    );

    ElectronShutdownHandler.blockShutdown('Please wait for graceful shutdown');

    ElectronShutdownHandler.on('shutdown', async () => {
        log('info', 'Received shutdown event, gracefully quitting app');

        /**
         * Stop all cron jobs, to prevent unfulfilled promises.
         */
        destroyTray();
        await stopFarms();

        /**
         * Allow app to shutdown.
         */
        ElectronShutdownHandler.releaseShutdown();
        setAppQuitting(true);
        app.quit();
    });

    log('info', 'Handling shutdown of client');
}
