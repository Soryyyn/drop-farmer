import ElectronShutdownHandler from "@paymoapp/electron-shutdown-handler";
import { app, session } from "electron";
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { initConfig, updateConfigFile } from "./config";
import { createTray, destroyTray } from "./electron/tray";
import { createMainWindow, getMainWindow, setAppQuitting } from "./electron/windows";
import { destroyAllFarmWindows, initFarms, stopFarmJobs } from "./farms/management";
import { internetConnectionChecker } from "./util/internet";
import { initLogger, log } from "./util/logger";
import { initPuppeteerConnection } from "./util/puppeteer";
/**
 * If application is in run in production environment.
 */
const inProd: boolean = (process.env.NODE_ENV === "production");

/**
 * Handling the creating/deletion of shortcuts when installing/uninstalling via squirrel.
 */
if (require("electron-squirrel-startup")) {
    app.quit();
}

/**
 * Update checking / downloading.
 */
require("./electron/update");

/**
 * Initialize all drop-farmer background functions.
 */
initLogger();
initConfig();
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
         * Check if app needs to clear cache.
         */
        if (process.env.CLEAR_CACHE && process.env.CLEAR_CACHE!.trim() == "1") {
            log("MAIN", "WARN", "Cleared application session data");
            session.defaultSession.clearStorageData();
        }

        /**
         * Install react devtools extension if in development mode.
         */
        if (!inProd) {
            installExtension(REACT_DEVELOPER_TOOLS)
                .then((extensionName: string) => {
                    log("MAIN", "DEBUG", `Installed ${extensionName} extension`);
                })
                .catch((err) => {
                    log("MAIN", "ERROR", `Failed adding extension. ${err}`);
                });
        }

        /**
         * Create the system tray.
         */
        createTray(inProd);

        /**
         * Create the actual application window and show it when it has
         * been created (if set).
         */
        createMainWindow(inProd);

        /**
         * Repeatedly check the internet connection.
         *
         * Only initializing after the main window has been created to
         * avoid fatal crash.
         */
        internetConnectionChecker();

        /**
         * Load all ipc listeners when the app is ready.
         */
        require("./electron/ipc");

        /**
         * Block the shutdown process.
         * And set the native window handle for handling windows shutdown events.
         * e.x. blocking it while the farms are checking.
         */
        ElectronShutdownHandler.setWindowHandle(getMainWindow().getNativeWindowHandle());
        log("MAIN", "DEBUG", "Preventing system from shutting down before application savely quits");
        ElectronShutdownHandler.blockShutdown("Please wait for graceful shutdown");

        /**
         * React to the windows shutdown event firing.
         */
        ElectronShutdownHandler.on("shutdown", () => {
            log("MAIN", "INFO", "Received shutdown event, shutting down now");

            /**
             * Stop all cron jobs, to prevent unfulfilled promises.
             */
            stopFarmJobs();

            /**
             * Allow app to shutdown.
             */
            ElectronShutdownHandler.releaseShutdown();
            setAppQuitting(true);
            app.quit();
        });
    });

/**
 * Quitting routine.
 */
app.on("before-quit", () => {
    updateConfigFile();
    destroyTray();
    destroyAllFarmWindows();
});

/**
 * When quitting routine has finished.
 */
app.on("quit", () => {
    log("MAIN", "INFO", "Quitting application");
});