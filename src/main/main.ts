import { app, session } from "electron";
import eid from "electron-is-dev";
import { initFarms, saveDataToCache } from "./farms";
import { initLogger, log } from "./logger";
import { initPuppeteerConnection } from "./puppeteer";
import { initSettings } from "./settings";
import { createTray } from "./tray";
import { createMainWindow } from "./windows";

/**
 * Handling the creating/deletion of shortcuts when installing/uninstalling via squirrel.
 */
if (require("electron-squirrel-startup")) {
    app.quit();
}

/**
 * Initialize all drop-farmer background functions.
 */
initLogger();
initSettings();
initFarms();

/**
 * Puppeteer connection to electron application must happen before the app is ready.
 */
initPuppeteerConnection();

/**
 * Gets executed when electron has finished starting.
 * Some API's might only be available after it has started.
 */
app.whenReady()
    .then(() => {
        /**
         * Check if app is running as fresh/dev mode.
         */
        if (eid) {
            log("INFO", "Cleared application session data");
            session.defaultSession.clearStorageData();
        }

        /**
         * Create the system tray.
         */
        createTray();

        /**
         * Create the actual application window and show it when it has
         * been created.
         */
        createMainWindow();

        /**
         * Load all ipc listeners when the app is ready.
         */
        require("./ipc");
    });

/**
 * Close all farm windows when app quits.
 */
app.on("before-quit", () => {
    /**
     * Save the cache of each farm.
     */
    log("INFO", "Saving cache for each farm");
    saveDataToCache();

    log("INFO", "Quitting application");
});