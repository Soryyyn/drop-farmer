import { getTrayicon } from '@main/util/icons';
import { log } from '@main/util/logging';
import { app, Menu, Tray } from 'electron';
import { getMainWindow, showWindow } from './windows';

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
                showWindow(getMainWindow());
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit drop-farmer',
            type: 'normal',
            click: () => {
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
        showWindow(getMainWindow());
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
