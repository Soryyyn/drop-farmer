import { schedule } from "node-cron";
import { Timer } from "timer-node";
import { Channels } from "../common/channels";
import { checkInternetConnection } from "../internet";
import { sendOneWay } from "../ipc";
import { log } from "../logger";
import { createFarmWindow, getMainWindow } from "../windows";

export abstract class GameFarmTemplate {
    /**
     * If the farm is enabled or disabled.
     */
    private _enabled: boolean = false;

    /**
     * The game name.
     * Ex. "league-of-legends"
     */
    gameName: string = "league-of-legends";

    /**
     * The website to check for running stream.
     */
    checkerWebsite: string = "https://lolesports.com/";

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
     * Enable or disable the farm.
     *
     * @param enabled Boolean for enabling or disabling the farm.
     */
    setEnabled(enabled: boolean): void {
        this._enabled = enabled;
        this.status = (this._enabled) ? "idle" : "disabled";
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
     *
     * Re-cache after load.
     */
    setCachedFarmData(cachedData: Farm): void {
        this.gameName = cachedData.gameName;
        this._enabled = cachedData.enabled;
        this.checkerWebsite = cachedData.checkerWebsite;
        this.schedule = cachedData.schedule;
        // this.uptime = cachedData.uptime;

        /**
         * Set the status to idle if the farm is enabled.
         */
        this.status = (this._enabled) ? "idle" : "disabled";
    }

    /**
     * Create the farm checking window.
     * Destroy window after checking is done.
     */
    async createFarmCheckingWindow() {
        if (!this.checkerWindow)
            this.checkerWindow = await createFarmWindow(this.checkerWebsite, this.gameName);
    }

    /**
     * Login the user on the website.
     */
    abstract login(window: Electron.BrowserWindow): void;

    /**
     * Check the farming window(s) if they are still farming or the stream ended
     * or the drops are disabled.
     */
    abstract windowsStillFarming(window?: Electron.BrowserWindow): void;

    /**
     * Check the "checkerWebsite" if application is able to start farming.
     */
    abstract farmCheck(timeOfCheck: Date): void;

    /**
     * Commence the farming.
     */
    abstract startFarming(window: Electron.BrowserWindow): void;

    /**
     * Schedule the checking if the farm is enabled and app has internet connection
     */
    scheduleCheckingFarm(): void {
        checkInternetConnection()
            .then((connection) => {
                if (connection && this._enabled) {
                    log("MAIN", "INFO", `Starting schedule checking for farm \"${this.gameName}\"`);
                    schedule(`*/${this.schedule} * * * *`, (now: Date) => {
                        this.farmCheck(now);
                    });
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
}