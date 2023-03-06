import { log } from '@main/util/logging';
import { app, Menu, NativeImage, nativeImage, Tray } from 'electron';
import { resolve } from 'path';
import { getMainWindow, setAppQuitting, showWindow } from './windows';

/**
 * The tray object reference.
 */
let tray: Tray;

/**
 * Create the tray on app start.
 */
export function createTray(): void {
    tray = new Tray(getTrayicon());

    const contextMenu = Menu.buildFromTemplate([
        {
            label: `Current version: ${app.getVersion()}`,
            type: 'normal',
            enabled: false
        },
        {
            type: 'separator'
        },
        {
            label: 'Show Window',
            type: 'normal',
            click: () => {
                showWindow(getMainWindow(), true);
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit drop-farmer',
            type: 'normal',
            click: () => {
                setAppQuitting(true);
                app.quit();
            }
        }
    ]);

    /**
     * Set tooltip and context menu.
     */
    tray.setToolTip(
        `drop-farmer ${
            process.env.NODE_ENV === 'production' ? '' : '(dev environment)'
        }`
    );
    tray.setContextMenu(contextMenu);

    /**
     * On double click, show the main window.
     */
    tray.on('double-click', () => {
        showWindow(getMainWindow(), true);
    });

    log('info', 'Created system tray');
}

/**
 * Destroy the tray.
 */
export function destroyTray(): void {
    try {
        tray.destroy();
        log('info', 'Destroyed tray');
    } catch (err) {
        log('error', `Failed destroying tray. "${err}"`);
    }
}

/**
 * Get the approriate image for the tray depending on os.
 */
function getTrayicon(): NativeImage {
    const iconPath = 'resources/icon';

    if (process.platform === 'win32') {
        return nativeImage.createFromPath(
            resolve(__dirname, `${iconPath}.ico`)
        );
    } else if (process.platform === 'darwin') {
        return nativeImage.createFromPath(
            resolve(__dirname, `${iconPath}Template.png`)
        );
    } else {
        return nativeImage.createFromPath(
            resolve(__dirname, `${iconPath}.png`)
        );
    }
}
