import { app, BrowserWindow } from "electron";
import { initFarms } from "./farms";
import { initLogger } from "./logger";
import { initPuppeteerConnection } from "./puppeteer";
import { initSettings } from "./settings";
import { createMainWindow } from "./windows";

/**
 * Handling the creating/deletion of shortcuts when installing/uninstalling via squirrel.
 */
if (require("electron-squirrel-startup")) {
    app.quit();
}

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
         * Create the actual application window and show it when it has
         * been created.
         */
        createMainWindow();
        /**
         * Load all ipc listeners when the app is ready.
         */
        require("./ipc");

        /**
         * Initialize all drop-farmer background functions.
         */
        initLogger();
        initSettings();
        initFarms();
    });