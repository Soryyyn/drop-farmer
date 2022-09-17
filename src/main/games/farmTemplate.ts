import CrontabManager from "cron-job-manager";
import { resolve } from "path";
import { Channels } from "../common/channels";
import { getCurrentInternetConnection } from "../internet";
import { sendOneWay } from "../ipc";
import { log } from "../logger";
import { UptimeTimer } from "../timer";
import { createWindow, destroyWindow, getMainWindow } from "../windows";

/**
 * The template class for farms to implement.
 */
export default abstract class FarmTemplate {
    private _name: string;
    private _checkerWebsite: string;
    private _enabled: boolean = false;
    private _currentStatus: FarmStatus = "disabled";
    private _checkingSchedule: number = 30;
    private _checkerWindow: Electron.BrowserWindow | undefined = undefined;
    private _farmingWindows: FarmingWindowObject[] = [];
    private _taskManager: CrontabManager = new CrontabManager();
    private _uptimeTimer: UptimeTimer | undefined = undefined;

    constructor(name: string, checkerWebsite: string) {
        this._name = name;
        this._checkerWebsite = checkerWebsite;
        this._uptimeTimer = new UptimeTimer(`${name} (timer)`);
    }

    /**
     * Returns the farm name.
     */
    getName(): string {
        return this._name;
    }

    /**
     * Disable the farm and set the status to disabled.
     */
    disableFarm(): void {
        this._enabled = false;
        this.updateStatus("disabled");
        this._taskManager.stop("checking-schedule");

        log("MAIN", "INFO", `${this._name}: Disabled farm`);
    }

    /**
     * Enable the farm and set the status to idle.
     */
    enableFarm(): void {
        this._enabled = true;

        /**
         * Handle when other farms change but this one doesn't so it uses the
         * last status.
         */
        let lastStatus = this._currentStatus;
        if (this._currentStatus === "disabled" && this._enabled) {
            this.updateStatus("idle");
        } else {
            this.updateStatus(lastStatus);
        }

        this._taskManager.start("checking-schedule");

        log("MAIN", "INFO", `${this._name}: Enabled farm`);
    }

    /**
     * Returns if the farm is enabled or disabled.
     */
    isEnabled(): boolean {
        return this._enabled;
    }

    /**
     * Initialize the needed attributes and start the schedule if needed.
     * @param storeData
     */
    initialize(storeData: any): void {
        this._checkingSchedule = storeData.checkingSchedule;
        this._checkerWebsite = storeData.checkerWebsite;
        this._enabled = storeData.enabled;

        /**
         * Change the status depending if the farm is enabled or disabled.
         */
        this._currentStatus = (this._enabled) ? "idle" : "disabled";

        /**
         * Start the schedule if the farm is enabled.
         */
        this._taskManager.add("checking-schedule", `*/${this._checkingSchedule} * * * *`, () => {
            this._schedule();
        });

        if (this._enabled)
            this._taskManager.start("checking-schedule");

        log("MAIN", "INFO", `${this._name}: Initialized farm data`);
    }

    /**
     * Prepare the data of the farm which needs to be saved.
     */
    getFarmData(): FarmSaveData {
        return {
            enabled: this._enabled,
            name: this._name,
            checkerWebsite: this._checkerWebsite,
            checkingSchedule: this._checkingSchedule,
            uptime: this._uptimeTimer!.getAmount()
        }
    }

    /**
     * Apply new settings (e.x. from renderer) to the farm.
     *
     * @param {FarmSaveData} newSettings The new settings to apply to the farm.
     */
    applyNewSettings(newSettings: FarmSaveData): void {
        /**
         * Enable or disable farm.
         */
        (newSettings.enabled) ? this.enableFarm() : this.disableFarm();

        /**
         * Update schedule.
         */
        this.updateSchedule(newSettings.checkingSchedule);

        /**
         * Set checker website.
         */
        this._checkerWebsite = newSettings.checkerWebsite;

        log("MAIN", "INFO", `${this._name}: Applied new settings`);
    }

    /**
     * Update the status of the farm.
     *
     * @param status The new status to set.
     */
    updateStatus(status: FarmStatus): void {
        this._currentStatus = status;

        /**
         * Send the signal to the main window that a farms status has changed.
         */
        sendOneWay(getMainWindow(), Channels.farmStatusChange, {
            name: this._name,
            status: this._currentStatus,
        });

        log("MAIN", "INFO", `${this._name}: Updated status to ${this._currentStatus}`);
    }

    /**
     * Return the current farm stats.
     */
    getCurrentStatus(): FarmStatus {
        return this._currentStatus;
    }

    /**
     * Get the checker website.
     */
    getCheckerWebsite(): string {
        return this._checkerWebsite;
    }

    /**
     * Update the schedule.
     *
     * @param {number} newSchedule The new schedule to set.
     */
    updateSchedule(newSchedule: number): void {
        this._checkingSchedule = newSchedule;
        this._taskManager.update("checking-schedule", `*/${this._checkingSchedule} * * * *`);

        log("MAIN", "INFO", `${this._name}: Updated schedule to ${newSchedule}`);
    }

    /**
     * Create the checker window if not already exists.
     * If it fails to create the window `undefined` will be returned.
     * If it succeeds, the window will be returned.
     */
    createCheckerWindow(): Promise<Electron.BrowserWindow> {
        return new Promise<Electron.BrowserWindow>((resolve, reject) => {
            if (this._checkerWindow) {
                log("MAIN", "WARN", `${this._name}: Checker window already exists`);
                resolve(this._checkerWindow);
            } else {
                createWindow(this._checkerWebsite, this._name)
                    .then((createdWindow: Electron.BrowserWindow) => {
                        /**
                         * On checker window close (via tray, etc.) set the
                         * attribute back to undefined and destroy the window.
                         */
                        createdWindow.on("close", () => {
                            this._checkerWindow = undefined;
                            destroyWindow(createdWindow);
                        });

                        this._checkerWindow = createdWindow;

                        log("MAIN", "INFO", `${this._name}: Created checker window`);

                        resolve(this._checkerWindow);
                    })
                    .catch((err) => {
                        log("MAIN", "ERROR", `${this._name}: Failed creating checker window. ${err}`);
                        reject(err);
                    });
            }
        });
    }

    /**
     * Returns the checker window or undefined if not defined.
     */
    getCheckerWindow(): Electron.BrowserWindow | undefined {
        return this._checkerWindow;
    }

    /**
     * Create a farming window for the farm.
     * If it fails creating the window undefined will be returned.
     * If it succeeds the window will be returned.
     *
     * @param {string} urlToOpen The url for the farming window to open on load.
     */
    createFarmingWindow(urlToOpen: string): Promise<Electron.BrowserWindow> {
        return new Promise<Electron.BrowserWindow>(async (resolve, reject) => {
            createWindow(urlToOpen, this._name)
                .then((createdWindow: Electron.BrowserWindow) => {
                    /**
                     * Push window to array.
                     */
                    const index = this._farmingWindows.push({
                        window: createdWindow,
                        createdAt: Date.now()
                    });

                    /**
                     * Handle closing of the farming window.
                     */
                    createdWindow.on("close", () => {
                        destroyWindow(createdWindow);
                        this.removeFarmingWindowFromArray(index);
                    });

                    log("MAIN", "INFO", `${this._name}: Created farming window(${createdWindow.id})`);

                    resolve(createdWindow);
                })
                .catch((err) => {
                    log("MAIN", "ERROR", `${this._name}: Failed creating farming window. ${err}`);
                    reject(err);
                });
        });
    }

    /**
     * Get all farming windows.
     */
    getFarmingWindows(): FarmingWindowObject[] {
        return this._farmingWindows;
    }

    /**
     * Get the farming window by index.
     *
     * @param {number} index The index of the farming window to return.
     */
    getFarmingWindow(index: number): FarmingWindowObject {
        return this._farmingWindows[index];
    }

    /**
     * Remove the wanted index or farming window object from the
     * `farmingWindows` array.
     * If there are no windows left in the array after removal, the status gets
     * changed to `idle`.
     *
     * @param {number | FarmingWindowObject} toDestroy The index or the farming window object to get removed
     * and destroyed.
     */
    removeFarmingWindowFromArray(toDestroy: number | FarmingWindowObject): void {
        if (typeof toDestroy === "number") {
            destroyWindow(this._farmingWindows[toDestroy].window);
            this._farmingWindows.splice(toDestroy, 1);
        } else {
            const index: number = this._farmingWindows.indexOf(toDestroy);
            destroyWindow(this._farmingWindows[index].window);
            this._farmingWindows.splice(index, 1);
        }


        /**
         * If no more farming windows are in the array, return the farm status
         * to idle.
         */
        if (this._farmingWindows.length === 0)
            this.updateStatus("idle");

        log("MAIN", "INFO", `${this._name}: Removed farming window from array`);
    }

    /**
     * Destroy the checker window and set the attribute back to undefined.
     */
    destroyCheckerWindow(): void {
        if (this._checkerWindow != undefined) {
            destroyWindow(this._checkerWindow);
            this._checkerWindow = undefined;
        }

        log("MAIN", "INFO", `${this._name}: Destroyed checker window`);
    }

    /**
     * Destroy all farming windows.
     */
    destroyAllFarmingWindows(): void {
        for (const farmingWindow of this._farmingWindows) {
            this.removeFarmingWindowFromArray(farmingWindow);
        }

        log("MAIN", "INFO", `${this._name}: Destroyed all farming windows`);
    }

    /**
     * Show the checker window and all available farming windows.
     */
    showAllWindows(): void {
        this._checkerWindow?.show();
        for (const windowObject of this._farmingWindows)
            windowObject.window.show();

        log("MAIN", "INFO", `${this._name}: Showing all windows of farm`);
    }

    /**
     * Hide the checker window and all available farming windows.
     */
    hideAllWindows(): void {
        this._checkerWindow?.hide();
        for (const windowObject of this._farmingWindows)
            windowObject.window.hide();

        log("MAIN", "INFO", `${this._name}: Hidding all windows of farm`);
    }

    /**
     * Restart the schedule of the farm with the specified steps between.
     *
     * @param {() => void} stepsBetweenRestart The callback to execute between restart.
     */
    restartScheduler(stepsBetweenRestart?: () => void): void {
        this.destroyCheckerWindow();
        this.destroyAllFarmingWindows();

        this._taskManager.stop("checking-schedule");

        if (stepsBetweenRestart != undefined)
            Promise.all([
                stepsBetweenRestart()
            ]);


        this._taskManager.start("checking-schedule");

        log("MAIN", "INFO", `${this._name}: Restarted checking schedule`);
    }

    /**
     * Clear the cache of the farm.
     */
    async clearFarmCache(): Promise<void> {
        createWindow(this._checkerWebsite)
            .then(async (createdWindow: Electron.BrowserWindow) => {
                await createdWindow.webContents.session.clearCache();
                destroyWindow(createdWindow);
                log("MAIN", "INFO", `${this._name}: Cleared cache`);
            })
            .catch((err) => {
                log("MAIN", "ERROR", `${this._name}: Failed clearing cache. ${err}`);
            });
    }

    /**
     * Start or resume uptime timer.
     */
    timerAction(action: "start" | "stop" | "pause"): void {
        if (action === "start")
            this._uptimeTimer!.startTimer();
        else if (action === "stop")
            this._uptimeTimer!.stopTimer();
        else if (action === "pause")
            this._uptimeTimer!.pauseTimer();
    }

    /**
     * Get current farm uptime.
     */
    getCurrentUptime(): number {
        return this._uptimeTimer!.getAmount();
    }

    /**
     * Login the user into the site.
     *
     * @param {Electron.BrowserWindow?} window The window to control.
     */
    abstract login(window?: Electron.BrowserWindow): Promise<any>;

    /**
     * Check the farming window(s) if they need to be closed / are still farming.
     *
     * @param {Electron.BrowserWindow?} window The window to control.
     */
    abstract windowsStillFarming(window?: Electron.BrowserWindow): Promise<any>;

    /**
     * Start farming.
     *
     * @param {Electron.BrowserWindow?} window The window to control.
     */
    abstract startFarming(window?: Electron.BrowserWindow): Promise<any>;

    /**
     * The schedule to run on the schedule checking cron job.
     */
    private _schedule(): void {
        if (this._currentStatus !== "checking") {
            log("MAIN", "INFO", `${this._name}: Schedule check running`);
            this.updateStatus("checking");

            /**
             * Pause timer while checking.
             */
            this.timerAction("pause");

            this.createCheckerWindow()
                .then(async (checkerWindow) => {
                    await this.login(checkerWindow);
                    await this.windowsStillFarming(checkerWindow);
                    await this.startFarming(checkerWindow);

                    /**
                     * Destroy the checker window.
                     */
                    this.destroyCheckerWindow();

                    if (!this._enabled) {
                        this.updateStatus("disabled");
                    }
                })
                .catch((err) => {
                    log("MAIN", "ERROR", `${this._name}: Error occurred while checking the farm. ${err}`);
                    this.updateStatus("attention-required");
                });
        }
    }

}