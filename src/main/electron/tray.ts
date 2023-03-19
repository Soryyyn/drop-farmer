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

    /**
     * Hover tooltip.
     */
    tray.setToolTip(
        `Drop Farmer ${process.env.NODE_ENV === 'production' ? '' : '(DEV)'}`
    );

    /**
     * Set the context menu (right click menu).
     */
    tray.setContextMenu(
        Menu.buildFromTemplate([
            {
                label: `Version: ${app.getVersion()}`,
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
                label: 'Quit Drop Farmer',
                type: 'normal',
                click: () => {
                    app.quit();
                }
            }
        ])
    );

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
    tray.destroy();
    log('info', 'Destroyed tray');
}
