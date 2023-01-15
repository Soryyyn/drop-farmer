import { IpcChannels, Schedules } from '@main/common/constants';
import { sendOneWay } from '@main/electron/ipc';
import {
    createWindow,
    destroyWindow,
    hideWindow,
    showWindow
} from '@main/electron/windows';
import { log } from '@main/util/logging';
import { waitForTimeout } from '@main/util/puppeteer';
import { getStatistic, updateStatistic } from '@main/util/statistics';
import CrontabManager from 'cron-job-manager';
import dayjs from 'dayjs';
import { doesSettingExist, getSetting, setSetting } from '../util/settings';
import { Timer } from './timer';

export default abstract class FarmTemplate {
    id: string;
    url: string;
    isProtected: boolean;

    enabled: boolean = false;
    status: FarmStatus = 'disabled';
    schedule: number = 30;
    windowsShownByDefault: boolean = false;
    windowsCurrentlyShown: boolean = false;

    timer: Timer;

    scheduler: CrontabManager = new CrontabManager();

    checker: Electron.BrowserWindow | undefined = undefined;
    farmers: Electron.BrowserWindow[] = [];
    extras: Electron.BrowserWindow[] = [];

    conditions: FarmingConditions = {
        timeframe: 'unlimited'
    };

    constructor(id: string, url: string, isProtected: boolean) {
        this.id = id;
        this.url = url;
        this.isProtected = isProtected;

        this.timer = new Timer(id);
    }

    initialize(): void {
        this.createOrSetFarmSettings();
        this.createOrSetStatistics();

        this.status = this.enabled ? 'idle' : 'disabled';

        this.scheduler.add(
            Schedules.CheckToFarm,
            `*/${this.schedule} * * * *`,
            () => {
                this.farmingSchedule();
            }
        );

        /**
         * Start the farm if it is enabled.
         */
        if (this.enabled) this.scheduler.startAll();

        log('info', `${this.id}: Initialized farm`);
    }

    applyNewSettings(): void {
        /**
         * Enable or disable the farm if necessary.
         */
        if ((getSetting(this.id, 'enabled')?.value as boolean) && !this.enabled)
            this.enable();
        else if (
            !(getSetting(this.id, 'enabled')?.value as boolean) &&
            this.enabled
        )
            this.disable();

        /**
         * Set the setting if created windows should be shown.
         */
        if (getSetting('application', 'showWindowsForLogin')?.value as boolean)
            this.windowsShownByDefault === true;
        else this.windowsShownByDefault === false;

        /**
         * Set the schedule if it changed.
         */
        if (
            (getSetting(this.id, 'schedule')?.value as number) !== this.schedule
        )
            this.updateSchedule(
                getSetting(this.id, 'schedule')?.value as number
            );
    }

    createOrSetFarmSettings(): void {
        if (doesSettingExist(this.id, 'enabled')) {
            this.enabled = getSetting(this.id, 'enabled')?.value as boolean;
        } else {
            setSetting(this.id, {
                id: 'enabled',
                shown: 'Farm enabled',
                desc: 'Enable or disable this farm.',
                value: this.enabled,
                default: false
            });
        }

        if (doesSettingExist(this.id, 'schedule')) {
            this.schedule = getSetting(this.id, 'schedule')?.value as number;
        } else {
            setSetting(this.id, {
                id: 'schedule',
                shown: 'Farming schedule',
                desc: 'The schedule (in minutes) on which drop-farmer will check if farming is possible.',
                value: this.schedule,
                default: 30,
                max: 60,
                min: 1
            });
        }

        if (doesSettingExist(this.id, 'url')) {
            this.url = getSetting(this.id, 'url')?.value as string;
        } else {
            setSetting(this.id, {
                id: 'url',
                shown: 'Checking URL',
                desc: 'The URL the farm will check if it can farm.',
                value: this.url,
                default: this.url,
                disabled: true
            });
        }

        if (getSetting('application', 'showWindowsForLogin')?.value as boolean)
            this.windowsShownByDefault === true;
        else this.windowsShownByDefault === false;

        /**
         * Condition settings.
         */
        if (doesSettingExist(this.id, 'started')) {
            const started = getSetting(this.id, 'started')?.value as string;
            if (started !== '') {
                this.conditions.started = dayjs(started).toDate();
            }
        } else {
            setSetting(this.id, {
                id: 'started',
                value: ''
            });
        }

        if (doesSettingExist(this.id, 'fulfilled')) {
            const fulfilled = getSetting(this.id, 'fulfilled')?.value as string;
            if (fulfilled !== '') {
                this.conditions.fulfilled = dayjs(fulfilled).toDate();
            }
        } else {
            setSetting(this.id, {
                id: 'fulfilled',
                value: ''
            });
        }

        if (doesSettingExist(this.id, 'amount')) {
            this.conditions.amount = getSetting(this.id, 'amount')
                ?.value as number;
        } else {
            setSetting(this.id, {
                id: 'amount',
                value: 0
            });
        }

        if (doesSettingExist(this.id, 'amountToFulfill')) {
            this.conditions.amountToFulfill = getSetting(
                this.id,
                'amountToFulfill'
            )?.value as number;
        } else {
            setSetting(this.id, {
                id: 'amountToFulfill',
                shown: 'Amount to fulfill condition',
                desc: 'The amount of hours the farm needs to farm before the stopping/reset condition has been fulfilled.',
                value: 4,
                default: 4,
                disabled: false,
                min: 1,
                max: 730
            });
        }

        if (doesSettingExist(this.id, 'buffer')) {
            this.conditions.buffer = getSetting(this.id, 'buffer')
                ?.value as number;
        } else {
            setSetting(this.id, {
                id: 'buffer',
                shown: 'Buffer',
                desc: 'The buffer (in minutes) controls how much longer the farm will farm as a buffer because drops may not exactly happen on the hour.',
                value: 30,
                default: 30,
                disabled: false,
                min: 0,
                max: 60
            });
        }

        if (doesSettingExist(this.id, 'timeframe')) {
            this.conditions.timeframe = getSetting(this.id, 'timeframe')
                ?.value as Timeframe;
        } else {
            setSetting(this.id, {
                id: 'timeframe',
                shown: 'Timeframe',
                desc: 'The timeframe in which the farm will try to fulfill the condition. The condition will reset depending on the timeframe. ',
                value: 'unlimited',
                default: 'unlimited',
                options: ['weekly', 'monthly', 'unlimited'],
                disabled: false,
                ignores: {
                    onValue: 'unlimited',
                    ids: ['amountToFulfill', 'buffer', 'repeating']
                }
            });
        }

        if (doesSettingExist(this.id, 'repeating')) {
            this.conditions.repeating = getSetting(this.id, 'repeating')
                ?.value as boolean;
        } else {
            setSetting(this.id, {
                id: 'repeating',
                shown: 'Repeat after timeframe reset',
                desc: 'If the farm should repeat the condition after the timeframe is fulfilled.',
                value: true,
                default: true,
                disabled: false
            });
        }
    }

    createOrSetStatistics(): void {
        const stat = getStatistic(this.id);
        if (stat === undefined) {
            updateStatistic(this.id, {
                uptime: 0,
                openedWindows: 0
            });
        }
    }

    private getAmountOfWindows(): number {
        let amount = 0;

        if (this.checker) amount++;
        amount += this.farmers.length;
        amount += this.extras.length;

        return amount;
    }

    getRendererData(): FarmRendererData {
        return {
            id: this.id,
            status: this.status,
            schedule: this.schedule,
            isProtected: this.isProtected,
            amountOfWindows: this.getAmountOfWindows(),
            windowsShown: this.windowsCurrentlyShown
        };
    }

    protected updateStatus(status: FarmStatus): void {
        this.status = status;
        sendOneWay(IpcChannels.farmStatusChange, this.getRendererData());
    }

    protected updateSchedule(schedule: number): void {
        this.schedule = schedule;
        this.scheduler.update(Schedules.CheckToFarm, `*/${schedule} * * * *`);
        sendOneWay(IpcChannels.farmStatusChange, this.getRendererData());
    }

    enable(): void {
        this.enabled = true;

        /**
         * Keep the recent status instead of idle.
         * If the farm was just enabled, set it to idle.
         */
        const recentStatus = this.status;
        if (this.status === 'disabled' && this.enabled)
            this.updateStatus('idle');
        else this.updateStatus(recentStatus);

        this.scheduler.startAll();
    }

    disable(): void {
        this.enabled = false;
        this.updateStatus('disabled');
        this.scheduler.stopAll();
        this.destroyAllWindows();

        /**
         * Stop the timer if the farm has been disabled.
         */
        this.timer.stopTimer();
    }

    protected destroyChecker() {
        if (this.checker) {
            destroyWindow(this.checker);
            this.checker = undefined;
        }
    }

    /**
     * Nice recursive function to either destroy the wanted window from an
     * array, or destroy all windows inside the array via recursion.
     */
    protected destroyWindowFromArray(
        array: Electron.BrowserWindow[],
        window?: Electron.BrowserWindow
    ): void {
        if (window) {
            array.splice(array.indexOf(window), 1);
            destroyWindow(window);
        } else {
            for (const window of array)
                this.destroyWindowFromArray(array, window);
        }
    }

    destroyAllWindows(): void {
        this.destroyChecker();
        this.destroyWindowFromArray(this.farmers);
        this.destroyWindowFromArray(this.extras);
    }

    private async addWindowStatistic(): Promise<void> {
        const stat = getStatistic(this.id);
        await updateStatistic(this.id, {
            ...stat!,
            openedWindows: stat?.openedWindows! + 1
        });
    }

    private async addUptimeAmount(): Promise<void> {
        const stat = getStatistic(this.id);
        await updateStatistic(this.id, {
            ...stat!,
            uptime: stat!.uptime + this.timer.amount
        });
    }

    protected createCheckerWindow(): Promise<Electron.BrowserWindow> {
        return new Promise<Electron.BrowserWindow>((resolve, reject) => {
            if (this.checker) {
                resolve(this.checker);
            } else {
                createWindow(
                    this.url,
                    this.windowsShownByDefault || this.windowsCurrentlyShown
                )
                    .then(async (window: Electron.BrowserWindow) => {
                        window.on('close', () => {
                            this.checker = undefined;
                            destroyWindow(window);
                        });

                        this.checker = window;

                        await this.addWindowStatistic();
                    })
                    .then(() => {
                        resolve(this.checker!);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
        });
    }

    protected createArrayWindow(
        url: string,
        array: Electron.BrowserWindow[]
    ): Promise<Electron.BrowserWindow> {
        return new Promise<Electron.BrowserWindow>((resolve, reject) => {
            createWindow(
                url,
                this.windowsShownByDefault || this.windowsCurrentlyShown
            )
                .then(async (window: Electron.BrowserWindow) => {
                    window.on('close', () => {
                        this.destroyWindowFromArray(array, window);
                        destroyWindow(window);
                    });

                    array.push(window);

                    await this.addWindowStatistic();
                })
                .then(() => {
                    resolve(array[array.length - 1]);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    toggleWindowsVisibility(forcedVisibility?: boolean): void {
        if (forcedVisibility === undefined) {
            if (this.windowsCurrentlyShown) {
                if (this.checker) hideWindow(this.checker, false);
                for (const window of this.farmers) hideWindow(window, false);
                for (const window of this.extras) hideWindow(window, false);
            } else {
                if (this.checker) showWindow(this.checker, false);
                for (const window of this.farmers) showWindow(window, false);
                for (const window of this.extras) showWindow(window, false);
            }

            this.windowsCurrentlyShown = !this.windowsCurrentlyShown;
        } else {
            if (!forcedVisibility) {
                if (this.checker) hideWindow(this.checker, false);
                for (const window of this.farmers) hideWindow(window, false);
                for (const window of this.extras) hideWindow(window, false);
            } else {
                if (this.checker) showWindow(this.checker, false);
                for (const window of this.farmers) showWindow(window, false);
                for (const window of this.extras) showWindow(window, false);
            }

            this.windowsCurrentlyShown = forcedVisibility;
        }

        /**
         * Notify renderer about the change.
         */
        sendOneWay(IpcChannels.farmStatusChange, this.getRendererData());
    }

    restartScheduler(steps?: () => void): void {
        this.destroyAllWindows();

        this.scheduler.stopAll();
        if (steps) Promise.all([steps()]);
        this.scheduler.startAll();

        if (this.status === 'disabled') {
            this.updateStatus('disabled');
        } else {
            this.updateStatus('idle');
        }
    }

    async clearCache(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.createArrayWindow(this.url, this.extras)
                .then(async (window) => {
                    await window.webContents.session.clearCache();
                    await window.webContents.session.clearStorageData();
                    return window;
                })
                .then((window) => {
                    this.destroyWindowFromArray(this.extras, window);
                    resolve(undefined);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * The farming flow function which need to be defined by each farm themselves.
     */
    abstract login(window: Electron.BrowserWindow): Promise<void>;
    abstract stillFarming(window: Electron.BrowserWindow): Promise<void>;
    abstract startFarming(window: Electron.BrowserWindow): Promise<void>;

    /**
     * The farming schedule itself which will start if the farm is enabled.
     */
    private farmingSchedule(): void {
        if (
            this.status !== 'checking' &&
            this.status !== 'attention-required'
        ) {
            this.createCheckerWindow()
                .then(async (window) => {
                    this.timer.stopTimer();
                    await this.addUptimeAmount();

                    this.updateStatus('checking');

                    await this.login(window);
                    if (this.farmers.length > 0) {
                        await this.stillFarming(window);
                    }
                    await this.startFarming(window);
                })
                .then(async () => {
                    /**
                     * Wait for 2 seconds for the window to be actually created.
                     */
                    await waitForTimeout(2000);

                    this.destroyChecker();
                })
                .catch((err) => {
                    log(
                        'error',
                        `${this.id}: Error occurred while checking the farm. ${err}`
                    );
                    this.updateStatus('attention-required');
                })
                .finally(() => {
                    /**
                     * Set the status to farming if there are >0 farming
                     * windows, otherwise set it to idle.
                     */
                    if (this.farmers.length > 0) {
                        this.updateStatus('farming');
                        this.timer.startTimer();
                    } else {
                        this.updateStatus('idle');
                    }

                    /**
                     * If the farm has been disabled mid-check, set the status
                     * to disable once again to be sure.
                     */
                    if (!this.enabled && this.status !== 'attention-required') {
                        this.updateStatus('disabled');
                    }
                });
        }
    }
}
