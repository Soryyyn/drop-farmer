import {
    FarmSettings,
    FarmStatusEnum,
    NewConditionType
} from '@df-types/farms.types';
import { SettingId, SettingOwnerType } from '@df-types/settings.types';
import { createWindow, destroyWindow } from '@main/electron/windows';
import { getSettingValue } from '@main/store/settings';
import { Schedules } from '@main/util/constants';
import {
    DefaultFarmSettings,
    createCheckingSchedule,
    createFarmSettings,
    getInitialStatus,
    hydrateFarm
} from '@main/util/farming';
import { log } from '@main/util/logging';
import { cancelPromise } from '@main/util/promises';
import { waitForTimeout } from '@main/util/puppeteer';
import CrontabManager from 'cron-job-manager';
import { BrowserWindow } from 'electron';

export default abstract class NewFarmTemplate {
    name: string;
    type: SettingOwnerType;
    settings: FarmSettings;

    scheduleUUID: string | undefined;
    scheduler = new CrontabManager();

    /**
     * Windows of the farm.
     */
    checker: BrowserWindow | undefined = undefined;
    farmers: BrowserWindow[] = [];
    extras: BrowserWindow[] = [];

    /**
     * Construct the template with the default farm settings.
     */
    constructor(name: string, type: SettingOwnerType) {
        this.name = name;
        this.type = type;
        this.settings = { ...DefaultFarmSettings };
    }

    /**
     * Initialize the farm and its settings, etc.
     */
    init() {
        createFarmSettings(this);
        hydrateFarm(this);

        this.settings.status = getInitialStatus(this);

        createCheckingSchedule(this);
        log('info', `${this.name}: Initialized`);
    }

    /**
     * Stop the schedule, farming, etc. in it's track.
     */
    stop() {
        this.scheduler.stopAll();

        /**
         * If the schedule promise is running, cancel it.
         */
        if (this.scheduleUUID) {
            cancelPromise(this.scheduleUUID);
            this.scheduleUUID = undefined;
        }

        log('info', `${this.name}: Stopped farm`);
    }

    /**
     * Update the state of the enable (is farm enabled or not).
     */
    updateEnable(enabled: boolean) {
        this.settings.enabled = enabled;

        /**
         * Update the status, based on it's last status.
         */
        if (enabled) {
            /**
             * Check if conditions have been fulfilled.
             */
            if (
                this.settings.conditions.type !== NewConditionType.Unlimited &&
                this.settings.conditions.fulfilled
            ) {
                this.updateStatus(FarmStatusEnum.ConditionFulfilled);
            } else {
                this.updateStatus(FarmStatusEnum.Idle);
            }

            /**
             * Start the scheduler after enabling the farm.
             */
            this.scheduler.startAll();
        } else {
            this.updateStatus(FarmStatusEnum.Disabled);
            this.scheduler.stopAll();
        }
    }

    /**
     * Update the status of the farm.
     */
    updateStatus(status: FarmStatusEnum) {
        this.settings.status = status;
    }

    /**
     * Update the schedule.
     */
    updateSchedule(schedule: number) {
        this.settings.schedule = schedule;

        /**
         * Update the scheduler to also update it's cron job.
         */
        if (this.scheduler.exists(Schedules.CheckToFarm)) {
            this.scheduler.update(
                Schedules.CheckToFarm,
                `*/${schedule} * * * *`
            );
        }
    }

    /**
     * Create the checker window.
     */
    protected async createCheckerWindow() {
        /**
         * Return the window if there is already one.
         */
        if (this.checker) {
            return this.checker;
        }

        try {
            const created = await createWindow(
                this.settings.url,
                this.settings.windowsShowing
            );
            this.checker = created;
            log('info', `${this.name}: Created checker window`);

            return this.checker;
        } catch (error) {
            log(
                'error',
                `${this.name}: Failed creating checker window, ${error}`
            );

            return undefined;
        }
    }

    /**
     * Create a window for an array window type.
     */
    protected async createArrayWindow(url: string, array: BrowserWindow[]) {
        try {
            const created = await createWindow(
                url,
                this.settings.windowsShowing
            );
            array.push(created);

            log('info', `${this.name}: Created array window`);

            return array.at(-1);
        } catch (error) {
            log(
                'error',
                `${this.name}: Failed creating array window, ${error}`
            );

            return undefined;
        }
    }

    /**
     * Destroy the checker window and destroy the reference.
     */
    protected destroyCheckerWindow() {
        if (this.checker) {
            destroyWindow(this.checker);
            this.checker = undefined;

            log('info', `${this.name}: Destroyed checker window`);
        }
    }

    /**
     * Destroy a specific window (or all when no window is passed) from an array.
     */
    protected destroyWindowFromArray(
        array: BrowserWindow[],
        window?: BrowserWindow
    ) {
        if (window) {
            array.splice(array.indexOf(window), 1);
            destroyWindow(window);
            log('info', `${this.name}: Destroyed specific window`);
            return;
        }

        array.forEach((window, index) => {
            array.splice(index, 1);
            destroyWindow(window);
        });
        log('info', `${this.name}: Destroyed all windows from array`);
    }

    /**
     * Destroy all windows of the farms.
     */
    protected destroyAllWindows() {
        this.destroyCheckerWindow();
        this.destroyWindowFromArray(this.farmers);
        this.destroyWindowFromArray(this.extras);

        log('info', `${this.name}: Destroyed all windows`);
    }

    /**
     * Clear the cache for the farm.
     */
    async clearCache() {
        const window = await this.createArrayWindow(
            this.settings.url,
            this.extras
        );

        if (window) {
            await window.webContents.session.clearCache();
            await window.webContents.session.clearStorageData();

            /**
             * Wait for 1second to make sure stuff has been deleted.
             */
            await waitForTimeout(1000);

            this.destroyWindowFromArray(this.extras, window);

            log('info', `${this.name}: Cleared cache`);
        }
    }

    /**
     * Restart the schedule.
     * Pass in a status to be after the restart or steps to do before starting
     * up the stchedule again.
     */
    async restartSchedule(
        statusAfterRestart?: FarmStatusEnum,
        executeBetweenRestart?: () => Promise<void>
    ) {
        this.stop();
        if (executeBetweenRestart) Promise.all([executeBetweenRestart()]);
        this.scheduler.startAll();

        /**
         * If the status the farm is disabled, set the status to disabled or the
         * status given.
         * Fall back to 'idle'.
         */
        if (!this.settings.enabled) {
            this.updateStatus(FarmStatusEnum.Disabled);
        } else if (statusAfterRestart) {
            this.updateStatus(statusAfterRestart);
        } else {
            this.updateStatus(FarmStatusEnum.Idle);
        }

        log('info', `${this.name}: Restarted schedule`);
    }

    /**
     * Functions which will be implemented by the farms.
     */
    abstract login(window: BrowserWindow): Promise<void>;
    abstract stillFarming(window: BrowserWindow): Promise<void>;
    abstract startFarming(window: BrowserWindow): Promise<void>;
    abstract setLowestQualityPossible(): Promise<void>;

    /**
     * the schedule which gets ran when the schedule cron job is triggered.
     */
    async schedule() {
        try {
            /**
             * Create the checker window and set the initial status.
             */
            const checker = await this.createCheckerWindow();
            this.updateStatus(FarmStatusEnum.Checking);

            /**
             * If the checker creation succeeded, continue.
             */
            if (checker) {
                await this.login(checker);

                /**
                 * Check if the farm is still farming, by checking for the
                 * length of farming windows.
                 */
                if (this.farmers.length > 0) await this.stillFarming(checker);

                await this.startFarming(checker);

                /**
                 * If the setting is enabled, set the lowest quality possible.
                 */
                if (
                    this.farmers.length > 0 &&
                    getSettingValue('application', SettingId.LowResolution)
                )
                    await this.setLowestQualityPossible();
            }

            /**
             * Wait for 2seconds to destroy the checker window.
             */
            await waitForTimeout(2000);
            this.destroyCheckerWindow();

            /**
             * Update the status based on the amount of farming windows.
             */
            if (this.farmers.length > 0) {
                this.updateStatus(FarmStatusEnum.Farming);
            } else {
                this.updateStatus(FarmStatusEnum.Idle);
            }

            /**
             * If the farm may have been disabled.
             */
            if (
                !this.settings.enabled &&
                this.settings.status !== FarmStatusEnum.AttentionRequired
            ) {
                this.updateStatus(FarmStatusEnum.Disabled);
            }

            log('info', `${this.name}: Finished schedule check`);
        } catch (error) {
            log(
                'error',
                `${this.name}: Something went wrong while running the farming schedule, ${error}`
            );
            this.updateStatus(FarmStatusEnum.AttentionRequired);
        }
    }
}
