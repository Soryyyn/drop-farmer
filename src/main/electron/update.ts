import { app, autoUpdater } from "electron";
import { log } from "../util/logger";

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

if (!checkIfFirstRun()) {
    if (process.env.NODE_ENV === "production") {
        log("MAIN", "INFO", "Auto-update-checking is enabled");
        setInterval(() => {
            autoUpdater.checkForUpdates();
        }, 15000);
    } else {
        log("MAIN", "WARN", "Auto-update-checking is disabled");
    }
} else {
    log("MAIN", "WARN", "First run of application after install/update. No automatic update checking enabled")
}

autoUpdater.on("checking-for-update", () => {
    log("MAIN", "INFO", "CURRENTLY CHECKING FOR UPDATE");
});

autoUpdater.on("update-not-available", () => {
    log("MAIN", "INFO", "NO UPDATE AVAILBALE");
});

autoUpdater.on("update-available", () => {
    log("MAIN", "INFO", "UPDATE AVAILABLE");
});
