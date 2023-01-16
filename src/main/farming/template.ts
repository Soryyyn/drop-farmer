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
import Duration from 'dayjs/plugin/duration';
import {
    doesSettingExist,
    getSetting,
    setSetting,
    updateSetting
} from '../util/settings';
import { Timer } from './timer';

dayjs.extend(Duration);

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

        this.updateConditionsWithSettings();
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
                value: getStatistic(this.id)?.uptime ?? 0
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
                value: this.conditions.timeframe ?? 'unlimited',
                default: 'unlimited',
                options: ['weekly', 'monthly', 'unlimited'],
                disabled: false,
                ignores: {
                    onValue: 'unlimited',
                    ids: ['amountToFulfill', 'buffer', 'repeating']
                }
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
                value: this.conditions.amountToFulfill ?? 4,
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
                value: this.conditions.buffer ?? 30,
                default: 30,
                disabled: false,
                min: 0,
                max: 60
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
                value: this.conditions.repeating ?? true,
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

    private updateConditionsWithSettings(): void {
        this.conditions.timeframe = getSetting(this.id, 'timeframe')
            ?.value as Timeframe;

        this.conditions.amountToFulfill = getSetting(this.id, 'amountToFulfill')
            ?.value as number;

        this.conditions.buffer = getSetting(this.id, 'buffer')?.value as number;

        this.conditions.repeating = getSetting(this.id, 'repeating')
            ?.value as boolean;

        /**
         * Set the amount from the statistics.
         */
        this.conditions.amount = getStatistic(this.id)?.uptime;
    }

    protected updateConditionValues(): void {
        if (this.conditions.started)
            updateSetting(this.id, 'started', {
                id: 'started',
                value: dayjs(this.conditions.started).toISOString()
            });

        if (this.conditions.fulfilled)
            updateSetting(this.id, 'fulfilled', {
                id: 'fulfilled',
                value: dayjs(this.conditions.fulfilled).toISOString()
            });

        if (this.conditions.amount)
            updateSetting(this.id, 'amount', {
                id: 'amount',
                value: this.conditions.amount
            });
    }

    private resetConditions(): void {
        this.conditions.started = undefined;
        updateSetting(this.id, 'started', {
            id: 'started',
            value: ''
        });

        this.conditions.fulfilled = undefined;
        updateSetting(this.id, 'fulfilled', {
            id: 'fulfilled',
            value: ''
        });

        this.conditions.amount = undefined;
        updateSetting(this.id, 'amount', {
            id: 'amount',
            value: 0
        });

        log('info', `${this.id}: Conditions have been reset`);
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
    ) {
        return new Promise(async (resolve) => {
            if (window) {
                array.splice(array.indexOf(window), 1);
                destroyWindow(window);
            } else {
                for (let i = 0; array.length; i++) {
                    await destroyWindow(array[i]);
                    array.splice(i, 1);
                }
            }

            resolve(undefined);
        });
    }

    async destroyAllWindows() {
        this.destroyChecker();

        await this.destroyWindowFromArray(this.farmers);
        await this.destroyWindowFromArray(this.extras);
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

        /**
         * Set the amount from the statistics.
         */
        this.conditions.amount = getStatistic(this.id)?.uptime;
        this.updateConditionValues();
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
     * Check for conditions and what to do next.
     */
    private conditionCheck(): ConditionCheckReturn {
        /**
         * Check if the farm is set to unlimited farming.
         */
        if (this.conditions.timeframe === 'unlimited') {
            log('info', `${this.id}: Timeframe set to unlimited, farming now`);
            return 'farm';
        } else {
            /**
             * Check if the condition has a started date set.
             */
            if (!this.conditions.started) {
                log('info', `${this.id}: No started date set, farming now`);

                /**
                 * Set the started date.
                 */
                this.conditions.started = dayjs().toDate();
                this.updateConditionValues();
                return 'farm';
            } else {
                /**
                 * Farming has already started. Check if a fulfilled date has been set.
                 */
                if (!this.conditions.fulfilled) {
                    log(
                        'info',
                        `${this.id}: Fulfilled date is not set, checking if fulfilled`
                    );

                    /**
                     * Fulfilled has not been set. Check the timeframe amount and
                     * compare the current date with the started date.
                     */
                    const amountOfDaysFarmed: number = dayjs().diff(
                        dayjs(this.conditions.started),
                        'day'
                    );

                    if (
                        (this.conditions.timeframe === 'weekly' &&
                            amountOfDaysFarmed === 7) ||
                        (this.conditions.timeframe === 'monthly' &&
                            amountOfDaysFarmed === dayjs().daysInMonth())
                    ) {
                        /**
                         * Has reached its reset.
                         */
                        if (this.conditions.repeating) {
                            log(
                                'info',
                                `${this.id}: Reached timeframe reset, will reset now`
                            );
                            this.resetConditions();
                            return 'farm';
                        } else {
                            log(
                                'info',
                                `${this.id}: Reached timeframe reset, repeating is not enabled, will set fulfilled`
                            );
                            this.conditions.fulfilled = dayjs().toDate();
                            this.updateConditionValues();
                            this.updateStatus('condition-fulfilled');
                            return 'conditions-fulfilled';
                        }
                    } else {
                        /**
                         * Still time to farm, not at reset point.
                         */
                        if (this.conditions.amount) {
                            log(
                                'info',
                                `${this.id}: Checking if amount to fulfilled has been achieved`
                            );

                            const amountToAchieve = dayjs
                                .duration({
                                    hours: this.conditions.amountToFulfill,
                                    minutes: this.conditions.buffer
                                })
                                .asMilliseconds();

                            if (this.conditions.amount >= amountToAchieve) {
                                log(
                                    'info',
                                    `${this.id}: Achieved amount to fulfill condition, will set fulfilled`
                                );
                                this.conditions.fulfilled = dayjs().toDate();
                                this.updateConditionValues();
                                this.updateStatus('condition-fulfilled');
                                return 'conditions-fulfilled';
                            } else {
                                log(
                                    'info',
                                    `${this.id}: Has not achieved amount to fulfill yet, farm now`
                                );
                                return 'farm';
                            }
                        } else {
                            log(
                                'info',
                                `${this.id}: No amount achieved, will farm`
                            );
                            return 'farm';
                        }
                    }
                } else {
                    log(
                        'info',
                        `${this.id}: Already fulfilled amount, checking if can reset`
                    );

                    const amountOfDaysFarmed: number = dayjs().diff(
                        dayjs(this.conditions.started),
                        'day'
                    );

                    if (
                        (this.conditions.timeframe === 'weekly' &&
                            amountOfDaysFarmed === 7) ||
                        (this.conditions.timeframe === 'monthly' &&
                            amountOfDaysFarmed === dayjs().daysInMonth())
                    ) {
                        /**
                         * Has reached its reset.
                         */
                        if (this.conditions.repeating) {
                            log(
                                'info',
                                `${this.id}: Reached timeframe reset, will reset now`
                            );
                            this.resetConditions();
                            return 'farm';
                        } else {
                            log(
                                'info',
                                `${this.id}: Reached timeframe reset, repeating is not enabled, will set fulfilled`
                            );
                            this.conditions.fulfilled = dayjs().toDate();
                            this.updateConditionValues();
                            this.updateStatus('condition-fulfilled');
                            return 'conditions-fulfilled';
                        }
                    } else {
                        log(
                            'info',
                            `${this.id}: Not able to reset yet, set fulfilled`
                        );
                        this.updateStatus('condition-fulfilled');
                        return 'conditions-fulfilled';
                    }
                }
            }
        }
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
            /**
             * Check for conditions.
             */
            switch (this.conditionCheck()) {
                case 'conditions-fulfilled':
                    log(
                        'info',
                        `${this.id}: Condition fulfilled, will not farm`
                    );
                    break;
                case 'farm':
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
                            if (
                                !this.enabled &&
                                this.status !== 'attention-required'
                            ) {
                                this.updateStatus('disabled');
                            }
                        });

                    break;
            }
        }
    }
}
