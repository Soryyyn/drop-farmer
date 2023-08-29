import { app, Menu, Tray } from 'electron';
import { getTrayicon } from '../util/icons';
import { log, LogLevel } from '../util/logging';
import { getWindow, showWindow } from './window';

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
                    showWindow(getWindow(0));
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
        showWindow(getWindow(0));
    });

    log(LogLevel.Info, 'Created system tray');
}

/**
 * Destroy the tray.
 */
export function destroyTray(): void {
    tray.destroy();
    log(LogLevel.Info, 'Destroyed tray');
}
