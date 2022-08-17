import { app, Menu, Tray } from "electron";
import { log } from "./logger";
import { showMainWindow } from "./windows";

let quittingApp: boolean = false;
let tray: Tray;

/**
 * Create the tray on app start.
 */
export function createTray(): void {
    tray = new Tray("./resources/icon.ico");

    const contextMenu = Menu.buildFromTemplate([
        {
            label: `Current version: ${app.getVersion()}`,
            type: "normal",
            enabled: false
        },
        {
            type: "separator"
        },
        {
            label: "Show Window",
            type: "normal",
            click: () => {
                showMainWindow();
            }
        },
        {
            label: "Quit drop-farmer",
            type: "normal",
            click: () => {
                quittingApp = true;
                app.quit();
            }
        }
    ]);

    /**
     * Set tooltip and context menu.
     */
    tray.setToolTip("drop-farmer");
    tray.setContextMenu(contextMenu);

    log("INFO", "Created system tray");
}

/**
 * To make sure if the main window is closing or app is quiting.
 */
export function isQuitting(): boolean {
    return quittingApp;
}

export function destroyTray(): void {
    try {
        tray.destroy();
        log("INFO", "Destroyed tray");
    } catch (err) {
        log("ERROR", `Failed destroying tray. \"${err}\"`);
    }
}