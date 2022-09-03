import CrontabManager from "cron-job-manager";
import { Timer } from "timer-node";
import { Channels } from "../common/channels";
import { checkInternetConnection } from "../internet";
import { sendOneWay } from "../ipc";
import { log } from "../logger";
import { createWindow, destroyWindow, getMainWindow } from "../windows";

export abstract class GameFarmTemplate {
    /**
     * If the farm is enabled or disabled.
     */
    private _enabled: boolean = false;

    /**
     * The game name.
     * Ex. "league-of-legends"
     */
    gameName: string = "";

    /**
     * The website to check for running stream.
     */
    checkerWebsite: string = "";

    /**
     * The schedule on what the checking should happen.
     */
    schedule: number = 30;

    /**
     * The uptime of the farm in ms.
     * Gets loaded on app start from cache.
     */
    uptime: number = 0;

    /**
     * The timer of the farm track the uptime.
     */
    timer: Timer = new Timer();

    /**
     * The window on which the checking should happen.
     * Is null when window does not exist.
     */
    checkerWindow: Electron.BrowserWindow | null = null;

    /**
     * The window/s on which the farming takes place.
     * Empty array when no farming takes place.
     */
    farmingWindows: Electron.BrowserWindow[] = [];

    /**
     * The current status of the farm.
     */
    status: FarmStatus = "disabled";

    /**
     * The manager which handles the cron schedule task.
     */
    taskManager: CrontabManager = new CrontabManager();

    /**
     * Change the status of the farm.
     * Also notify the main windows / renderer process of the farm status change.
     *
     * @param newStatus The new status of the farm.
     */
    changeStatus(newStatus: FarmStatus): void {
        this.status = newStatus;
        sendOneWay(getMainWindow(), Channels.farmStatusChange, {
            gameName: this.gameName,
            status: this.status
        });
    }

    /**
     * Return the state if the farm is enabled or disabled.
     */
    getEnabled(): boolean {
        return this._enabled;
    }

    /**
     * Cache the data of the farm to the farms file.
     * Gets executed on application close or on changing of the settings.
     */
    getCacheData(): Farm {
        return {
            gameName: this.gameName,
            checkerWebsite: this.checkerWebsite,
            enabled: this._enabled,
            schedule: this.schedule,
            uptime: this.uptime
        };
    }

    /**
     * Load the cached farm data into the object.
     * Firstly re-cache the current data if necessary.
     * Re-cache after load.
     *
     * If the wanted settings are not found in the cache file, use the defaults.
     */
    setCachedFarmData(cachedData: Farm): void {
        this.gameName = cachedData.gameName || this.gameName;
        this._enabled = cachedData.enabled;
        this.checkerWebsite = cachedData.checkerWebsite || this.checkerWebsite;
        this.schedule = cachedData.schedule || this.schedule;

        /**
         * Change the status depending if the farm gets disabled, was disabled, etc.
         */
        let lastStatus = this.status;
        if (this.status === "disabled" && this._enabled) {
            this.status = "idle";
        } else if (!cachedData.enabled) {
            this.status = "disabled";
        } else {
            this.status = lastStatus;
        }

        /**
         * Add the schedule task to the task manager.
         */
        if (!this.taskManager.exists("scheduleChecking")) {
            this.taskManager.add("scheduleChecking", `*/${this.schedule} * * * *`, () => {
                this.farmCheck();
            });
        } else {
            this.taskManager.update("scheduleChecking", `*/${this.schedule} * * * *`);
        }

        /**
         * Enable or disable the schedule checking task after change.
         */
        if (this._enabled) {
            log("MAIN", "INFO", `Starting schedule checking for farm \"${this.gameName}\"`);
            this.taskManager.start("scheduleChecking");
        } else {
            log("MAIN", "INFO", `Stopped schedule checking for farm \"${this.gameName}\"`);
            this.taskManager.stop("scheduleChecking");
        }
    }

    /**
     * Create the farm checking window.
     * Destroy window after checking is done.
     */
    async createFarmCheckingWindow() {
        if (!this.checkerWindow) {
            this.checkerWindow = await createWindow(this.checkerWebsite, this.gameName);

            /**
             * Prevent errors from happening from closing the window (from tray,
             * etc.) by removing removing the reference.
             */
            this.checkerWindow.on("close", () => {
                this.checkerWindow = null;
            });
        }
    }

    /**
     * Create a farming window.
     *
     * @param {string} url The URL to load on the farming window.
     */
    async createFarmingWindow(url: string) {
        const window = await createWindow(url, this.gameName);

        /**
         * Prevent errors from happening from closing the window (from tray,
         * etc.) by removing removing the reference.
         */
        window.on("close", () => {
            let index = this.farmingWindows.indexOf(window);
            this.farmingWindows.splice(index, 1);

            /**
             * If all farming windows are closed, change the status to idle.
             */
            if (this.farmingWindows.length === 0)
                this.changeStatus("idle");
        });

        return window;
    }

    /**
     * Login the user on the website.
     */
    abstract login(): void;

    /**
     * Check the farming window(s) if they are still farming or the stream ended
     * or the drops are disabled.
     */
    abstract windowsStillFarming(): void;

    /**
     * Check the "checkerWebsite" if application is able to start farming.
     */
    abstract farmCheck(): void;

    /**
     * Commence the farming.
     */
    abstract startFarming(): void;

    /**
     * Schedule the checking if the farm is enabled and app has internet connection
     */
    scheduleCheckingFarm(): void {
        checkInternetConnection()
            .then((connection) => {
                if (connection) {
                    if (this._enabled) {
                        log("MAIN", "INFO", `Starting schedule checking for farm \"${this.gameName}\"`);
                        this.taskManager.start("scheduleChecking");
                    }
                }
            });
    }

    /**
     * Show the checker and all farming windows.
     */
    showWindows(): void {
        this.checkerWindow?.show();
        this.farmingWindows.forEach((window: Electron.BrowserWindow) => {
            window.show();
        });
    }

    /**
     * Hide the checker and all farming windows.
     */
    hideWindows(): void {
        this.checkerWindow?.hide();
        this.farmingWindows.forEach((window: Electron.BrowserWindow) => {
            window.hide();
        });
    }

    /**
     * Clear the cache of the farm.
     */
    clearCache(): void {
        createWindow(this.checkerWebsite)
            .then(async (window: Electron.BrowserWindow) => {
                await window.webContents.session.clearStorageData();
                log("MAIN", "INFO", `\"${this.gameName}\": Cleared cache`);
                destroyWindow(window);
            })
            .catch((err) => {
                log("MAIN", "ERROR", `\"${this.gameName}\": Failed clearing cache. ${err}`);
            });
    }

    /**
     * Restart the schedule of the farm with the specified steps between.
     *
     * @param {() => void} stepsBetweenRestart The callback to execute between restart.
     */
    restartScheduler(stepsBetweenRestart?: () => void): void {
        log("MAIN", "INFO", `\"${this.gameName
            }\": Restarted scheduler`);
        this.taskManager.stopAll();

        if (stepsBetweenRestart)
            stepsBetweenRestart();

        this.taskManager.startAll();
    }
}