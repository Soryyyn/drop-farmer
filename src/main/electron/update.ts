import { app, autoUpdater } from "electron";
import { saveCurrentDataOnQuit } from "../config";
import { destroyAllFarmWindows } from "../farms/management";
import { log } from "../util/logger";
import { destroyTray } from "./tray";

/**
 * Check if "--squirrel-firstrun" is in startup args, and don't auto-update.
 */
function checkIfFirstRun(): boolean {
    return (process.argv.indexOf("--squirrel-firstrun") > -1);
}

/**
 * The url to point to for updates.
 */
const updateURL: string = `https://drop-farmer-release-server.vercel.app/update/${process.platform}/${app.getVersion()}`;

/**
 * Set the feed url (so the autoupdater knows where to listen for updates).
 */
autoUpdater.setFeedURL({ url: updateURL });

/**
 * Only start the auto-checking for updates after the first run.
 */
if (!checkIfFirstRun()) {
    if (process.env.NODE_ENV === "production") {
        log("MAIN", "DEBUG", "Auto-update-checking is enabled");
        setInterval(() => {
            autoUpdater.checkForUpdates();
        }, 60000);
    } else {
        log("MAIN", "WARN", "Auto-update-checking is disabled");
    }
} else {
    log("MAIN", "WARN", "First run of application after install/update. No automatic update checking enabled")
}

autoUpdater.on("checking-for-update", () => {
    log("MAIN", "INFO", "Currently checking if application can update");
});

autoUpdater.on("update-not-available", () => {
    log("MAIN", "INFO", "No update available");
});

autoUpdater.on("update-available", () => {
    log("MAIN", "INFO", "Update to application is available! downloading...");
});

autoUpdater.on("update-downloaded", () => {
    log("MAIN", "INFO", "Update has finished downloading! installing now...");
    autoUpdater.quitAndInstall();
});

/**
 * `before-quit` will not be fired, so call all function here too.
 */
autoUpdater.on("before-quit-for-update", () => {
    saveCurrentDataOnQuit();
    destroyTray();
    destroyAllFarmWindows();
});

autoUpdater.on("error", (err) => {
    log("MAIN", "ERROR", `Failed downloading / installing update. ${err}`);
});
