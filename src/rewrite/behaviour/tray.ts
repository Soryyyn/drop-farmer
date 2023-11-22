import { app, Menu, Tray } from 'electron';
import { MAIN_WINDOW_INDEX } from '../util/constants';
import { getTrayicon } from '../util/icons';
import { log, LogLevel } from '../util/logging';
import { getWindow, showWindow } from './window';

let tray: Tray;

export function createTray(): void {
    tray = new Tray(getTrayicon());

    tray.setToolTip(
        `Drop Farmer ${process.env.NODE_ENV === 'production' ? '' : '(DEV)'}`
    );

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
                    showWindow(getWindow(MAIN_WINDOW_INDEX));
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
        showWindow(getWindow(MAIN_WINDOW_INDEX));
    });

    log(LogLevel.Info, 'Created system tray');
}

export function destroyTray(): void {
    tray.destroy();
    log(LogLevel.Info, 'Destroyed tray');
}
