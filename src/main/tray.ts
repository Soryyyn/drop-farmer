import { app, Menu, Tray } from "electron";
import { resolve } from "path";
import { log } from "./logger";
import { getMainWindow, setAppQuitting, showWindow } from "./windows";

/**
 * The tray object reference.
 */
let tray: Tray;

/**
 * Create the tray on app start.
 *
 * @param {boolean} isProd If the app is run in production environment.
 */
export function createTray(isProd: boolean): void {
    tray = new Tray(resolve(__dirname, "resources/icon.ico"));

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
                showWindow(getMainWindow(), true);
            }
        },
        {
            type: "separator"
        },
        {
            label: "Quit drop-farmer",
            type: "normal",
            click: () => {
                setAppQuitting(true);
                app.quit();
            }
        }
    ]);

    /**
     * Set tooltip and context menu.
     */
    tray.setToolTip(`drop-farmer ${!isProd ? "(dev environment)" : ""}`);
    tray.setContextMenu(contextMenu);

    /**
     * On double click, show the main window.
     */
    tray.on("double-click", () => {
        showWindow(getMainWindow(), true);
    });

    log("MAIN", "INFO", "Created system tray");
}

/**
 * Destroy the tray.
 */
export function destroyTray(): void {
    try {
        tray.destroy();
        log("MAIN", "INFO", "Destroyed tray");
    } catch (err) {
        log("MAIN", "ERROR", `Failed destroying tray. \"${err}\"`);
    }
}