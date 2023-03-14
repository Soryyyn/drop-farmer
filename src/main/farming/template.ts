import { EventChannels, IpcChannels, Schedules } from '@main/common/constants';
import { sendOneWay } from '@main/electron/ipc';
import {
    createWindow,
    destroyWindow,
    hideWindow,
    showWindow
} from '@main/electron/windows';
import {
    combineTimeUnits,
    dateToISOString,
    formattedStringToDate,
    getCurrentDate,
    isDateBetweenDates,
    ISOStringToDate,
    remainingDaysInMonth,
    remainingDaysInWeek
} from '@main/util/calendar';
import { emitEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import { waitForTimeout } from '@main/util/puppeteer';
import { updateFarmStatistic } from '@main/util/statistics';
import CrontabManager from 'cron-job-manager';
import makeCancellablePromise from 'make-cancellable-promise';
import {
    createSettingsOwner,
    deleteSetting,
    getSettingOrSet,
    getSettingsOfOwner,
    getSettingValue,
    setSettingValue
} from '../util/settings';
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

    /**
     * The currently running schedule.
     */
    runningSchedule:
        | {
              promise: Promise<unknown>;
              cancel(): void;
          }
        | undefined = undefined;

    conditions: FarmingConditions = {
        condition: {
            type: 'unlimited'
        }
    };

    constructor(id: string, url: string, isProtected: boolean) {
        this.id = id;
        this.url = url;
        this.isProtected = isProtected;

        this.timer = new Timer(id);
    }

    async initialize(): Promise<void> {
        await this.createOrSetFarmSettings();
        await this.applyNewSettings();

        /**
         * Set the initial status based on factors.
         */
        if (!this.enabled) {
            this.status = 'disabled';
        } else if (this.conditions.fulfilled !== undefined) {
            this.status = 'condition-fulfilled';
        } else {
            this.status = 'idle';
        }

        this.scheduler.add(
            Schedules.CheckToFarm,
            `*/${this.schedule} * * * *`,
            async () => {
                try {
                    this.runningSchedule?.cancel();
                    this.runningSchedule = makeCancellablePromise(
                        this.farmingSchedule()
                    );

                    await this.runningSchedule.promise;
                } catch (error) {
                    log(
                        'error',
                        `${this.id}: Failed running schedule check, error ${error}`
                    );
                }
            }
        );

        /**
         * Start the farm if it is enabled.
         */
        if (this.enabled) this.scheduler.startAll();

        log('info', `${this.id}: Initialized farm`);
    }

    /**
     * Create all settings depending on the farm type.
     */
    async createOrSetFarmSettings(): Promise<void> {
        return new Promise((resolve) => {
            createSettingsOwner(this.id);

            /**
             * Basic settings.
             */
            getSettingOrSet(this.id, 'farm-enabled')! as boolean;
            getSettingOrSet(this.id, 'farm-schedule', this.schedule)! as number;
            getSettingOrSet(this.id, 'farm-url', {
                value: this.url,
                disabled: true
            })!;

            /**
             * Settings gathered from application.
             */
            getSettingValue(
                'application',
                'application-showWindowsForLogin'
            )! as boolean;

            /**
             * Condition settings.
             */
            getSettingOrSet(
                this.id,
                'farm-condition-type',
                this.conditions.condition.type
            )! as ConditionType;

            if (this.conditions.condition.type !== 'unlimited') {
                getSettingOrSet(this.id, 'farm-condition-started')! as string;
                getSettingOrSet(this.id, 'farm-condition-fulfilled')! as string;
                getSettingOrSet(this.id, 'farm-condition-amount')! as number;
                getSettingOrSet(
                    this.id,
                    'farm-condition-amountToFulfill'
                )! as number;
                getSettingOrSet(this.id, 'farm-condition-buffer')! as number;
            }

            if (
                this.conditions.condition.type === 'monthly' ||
                this.conditions.condition.type === 'weekly'
            ) {
                getSettingOrSet(
                    this.id,
                    'farm-condition-repeating'
                )! as boolean;
            }

            if (this.conditions.condition.type === 'timeWindow') {
                getSettingOrSet(this.id, 'farm-condition-from', {
                    value: (this.conditions.condition.from as string) ?? '',
                    isDate: true
                });
                getSettingOrSet(this.id, 'farm-condition-to', {
                    value: (this.conditions.condition.to as string) ?? '',
                    isDate: true
                })! as string;
            }

            resolve();
        });
    }

    /**
     * Apply new setting values from the store.
     */
    async applyNewSettings(): Promise<void> {
        return new Promise(async (resolve) => {
            const farmSettings = getSettingsOfOwner(this.id)!;

            for (const [settingName, value] of Object.entries(farmSettings)) {
                switch (settingName) {
                    /**
                     * Default farm settings.
                     */
                    case 'farm-enabled':
                        (value as boolean) ? this.enable() : this.disable();
                        break;
                    case 'farm-schedule':
                        this.updateSchedule(value as number);
                        break;
                    case 'farm-url':
                        this.url = (value as SettingValueWithSpecial)
                            .value as string;
                        break;

                    /**
                     * Condition settings.
                     */
                    case 'farm-condition-started':
                        if (this.conditions.condition.type !== 'unlimited') {
                            if ((value as string) !== '') {
                                this.conditions.started = ISOStringToDate(
                                    value as string
                                );
                            } else {
                                this.conditions.started = undefined;
                            }
                        } else {
                            deleteSetting(this.id, 'farm-condition-started');
                        }
                        break;
                    case 'farm-condition-fulfilled':
                        if (this.conditions.condition.type !== 'unlimited') {
                            if ((value as string) !== '') {
                                this.conditions.fulfilled = ISOStringToDate(
                                    value as string
                                );
                            } else {
                                this.conditions.fulfilled = undefined;
                            }
                        } else {
                            deleteSetting(this.id, 'farm-condition-fulfilled');
                        }
                        break;
                    case 'farm-condition-type':
                        this.conditions.condition.type = value as ConditionType;
                        break;
                    case 'farm-condition-amount':
                        if (this.conditions.condition.type !== 'unlimited') {
                            this.conditions.condition.amount = value as number;
                        } else {
                            deleteSetting(this.id, 'farm-condition-amount');
                        }
                        break;
                    case 'farm-condition-amountToFulfill':
                        if (this.conditions.condition.type !== 'unlimited') {
                            this.conditions.condition.amountToFulfill =
                                value as number;
                        } else {
                            deleteSetting(
                                this.id,
                                'farm-condition-amountToFulfill'
                            );
                        }
                        break;
                    case 'farm-condition-buffer':
                        if (this.conditions.condition.type !== 'unlimited') {
                            this.conditions.condition.buffer = value as number;
                        } else {
                            deleteSetting(this.id, 'farm-condition-buffer');
                        }
                        break;
                    case 'farm-condition-repeating':
                        if (
                            this.conditions.condition.type !== 'unlimited' &&
                            this.conditions.condition.type !== 'timeWindow'
                        ) {
                            this.conditions.condition.repeating =
                                value as boolean;
                        } else {
                            deleteSetting(this.id, 'farm-condition-repeating');
                        }
                        break;
                    case 'farm-condition-from':
                        if (this.conditions.condition.type === 'timeWindow') {
                            this.conditions.condition.from = (
                                value as SettingValueWithSpecial
                            ).value as string;
                        } else {
                            deleteSetting(this.id, 'farm-condition-from');
                        }
                        break;
                    case 'farm-condition-to':
                        if (this.conditions.condition.type === 'timeWindow') {
                            this.conditions.condition.to = (
                                value as SettingValueWithSpecial
                            ).value as string;
                        } else {
                            deleteSetting(this.id, 'farm-condition-to');
                        }
                        break;
                }
            }

            /**
             * Create missing settings.
             */
            await this.createOrSetFarmSettings();

            log('info', `${this.id}: Applied new settings`);
            sendOneWay(IpcChannels.farmStatusChange, this.getRendererData());
            resolve();
        });
    }

    /**
     * Update the conditions value to keep track.
     */
    updateConditions(): void {
        if (this.conditions.condition.type !== 'unlimited') {
            if (this.conditions.condition.amount) {
                setSettingValue(
                    this.id,
                    'farm-condition-amount',
                    this.conditions.condition.amount
                );
            } else if (this.conditions.started) {
                setSettingValue(
                    this.id,
                    'farm-condition-started',
                    dateToISOString(this.conditions.started)
                );
            } else if (this.conditions.fulfilled) {
                setSettingValue(
                    this.id,
                    'farm-condition-fulfilled',
                    dateToISOString(this.conditions.fulfilled)
                );
            }
        }

        log('info', `${this.id}: Updated condition values`);
    }

    /**
     * Reset condition values in farm and in settings.
     */
    resetConditions(): void {
        if (this.conditions.condition.type !== 'unlimited') {
            delete this.conditions.started;
            setSettingValue(this.id, 'farm-condition-started');

            delete this.conditions.fulfilled;
            setSettingValue(this.id, 'farm-condition-fulfilled');

            delete this.conditions.condition.amount;
            setSettingValue(this.id, 'farm-condition-amount');
        }

        log('info', `${this.id}: Conditions have been reset`);
    }

    /**
     * Get the amount of windows of the farm which at the current time exist.
     */
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
            // amountLeftToFulfill: msInHours(
            //     combineTimeUnits({
            //         hours: this.conditions.condition.amountToFulfill,
            //         minutes: this.conditions.buffer
            //     }).asMilliseconds() - this.conditions.amount!,
            //     true
            // ),
            // nextConditionReset:
            //     this.conditions.timeframe === 'weekly'
            //         ? remainingDaysInWeek()
            //         : this.conditions.timeframe === 'monthly'
            //         ? remainingDaysInMonth()
            //         : Infinity
        };
    }

    /**
     * Update the status of a farm.
     */
    protected updateStatus(status: FarmStatus): void {
        this.status = status;
        sendOneWay(IpcChannels.farmStatusChange, this.getRendererData());
    }

    /**
     * Update the checking schedule.
     */
    protected updateSchedule(schedule: number): void {
        this.schedule = schedule;

        if (this.scheduler.exists(Schedules.CheckToFarm)) {
            this.scheduler.update(
                Schedules.CheckToFarm,
                `*/${schedule} * * * *`
            );
        }

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
        this.stop();
        this.destroyAllWindows();

        this.enabled = false;
        this.updateStatus('disabled');
    }

    /**
     * Stop the farm and all its thingies.
     */
    stop(): void {
        this.cancelFarmingSchedule();

        log('info', `${this.id}: Stopped farm`);
    }

    /**
     * Destroy the checker window.
     */
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
        if (window) {
            const index = array.indexOf(window);
            array.splice(index, 1);
            destroyWindow(window);
        } else {
            array.forEach((window, index) => {
                array.splice(index, 1);
                destroyWindow(window);
            });
        }
    }

    destroyAllWindows() {
        this.destroyChecker();

        this.destroyWindowFromArray(this.farmers);
        this.destroyWindowFromArray(this.extras);
    }

    private async addWindowStatistic(): Promise<void> {
        return new Promise(async (resolve) => {
            await updateFarmStatistic(this.id, {
                id: this.id,
                uptime: 0,
                openedWindows: 1
            });

            resolve();
        });
    }

    private async addUptimeAmount(): Promise<void> {
        return new Promise(async (resolve) => {
            /**
             * Update the statistic.
             */
            await updateFarmStatistic(this.id, {
                id: this.id,
                uptime: this.timer.amount,
                openedWindows: 0
            });

            /**
             * Also set the amount to the conditions.
             */
            if (this.conditions.condition.type !== 'unlimited') {
                this.conditions.condition.amount = this.conditions.condition
                    .amount
                    ? this.conditions.condition.amount + this.timer.amount
                    : this.timer.amount;
            }

            resolve();
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
                if (this.checker) hideWindow(this.checker);
                for (const window of this.farmers) hideWindow(window);
                for (const window of this.extras) hideWindow(window);
            } else {
                if (this.checker) showWindow(this.checker);
                for (const window of this.farmers) showWindow(window);
                for (const window of this.extras) showWindow(window);
            }

            this.windowsCurrentlyShown = !this.windowsCurrentlyShown;
        } else {
            if (!forcedVisibility) {
                if (this.checker) hideWindow(this.checker);
                for (const window of this.farmers) hideWindow(window);
                for (const window of this.extras) hideWindow(window);
            } else {
                if (this.checker) showWindow(this.checker);
                for (const window of this.farmers) showWindow(window);
                for (const window of this.extras) showWindow(window);
            }

            this.windowsCurrentlyShown = forcedVisibility;
        }

        /**
         * Notify renderer about the change.
         */
        sendOneWay(IpcChannels.farmStatusChange, this.getRendererData());
    }

    /**
     * Restart the scheduler with a status to set after and steps to execute in
     * the meantime.
     */
    async restartScheduler(withStatus?: FarmStatus, steps?: () => void) {
        return new Promise<void>(async (resolve) => {
            await this.addUptimeAmount();

            this.stop();
            if (steps) Promise.all([steps()]);
            this.scheduler.startAll();

            /**
             * Update the status if wanted or disable it if it was disabled in
             * the meantime.
             */
            if (this.status === 'disabled') {
                this.updateStatus('disabled');
            } else {
                this.updateStatus(withStatus ?? 'idle');
            }

            /**
             * Notify renderer of changed farms.
             */
            sendOneWay(IpcChannels.farmStatusChange, this.getRendererData());

            resolve();
        });
    }

    /**
     * Clear the cache of the farm.
     */
    async clearCache(): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            this.createArrayWindow(this.url, this.extras)
                .then(async (window) => {
                    await window.webContents.session.clearCache();
                    await window.webContents.session.clearStorageData();
                    return window;
                })
                .then((window) => {
                    this.destroyWindowFromArray(this.extras, window);
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Check for conditions and what to do next.
     */
    private async conditionCheck(): Promise<ConditionCheckReturn> {
        this.timer.stopTimer();
        await this.addUptimeAmount();

        /**
         * Check if the farm is set to unlimited farming.
         */
        if (this.conditions.condition.type === 'unlimited') {
            log('info', `${this.id}: Timeframe set to unlimited, farming now`);
            return 'farm';
        } else if (this.conditions.condition.type === 'timeWindow') {
            const fromDate = formattedStringToDate(
                this.conditions.condition.from!
            );
            const toDate = formattedStringToDate(this.conditions.condition.to!);

            if (isDateBetweenDates(getCurrentDate(), fromDate, toDate)) {
                /**
                 * Is in given time window.
                 */
                if (!this.conditions.started) {
                    this.conditions.started = getCurrentDate();
                }

                /**
                 * Check if amount has already been achieved.
                 */
                if (this.conditions.condition.amount) {
                    const amountToAchieve = combineTimeUnits({
                        hours: this.conditions.condition.amountToFulfill,
                        minutes: this.conditions.condition.buffer
                    }).asMilliseconds();

                    if (this.conditions.condition.amount >= amountToAchieve) {
                        if (!this.conditions.fulfilled) {
                            this.conditions.fulfilled = getCurrentDate();
                        }

                        log(
                            'info',
                            `${this.id}: Has already achieved amount to fulfill, condition fulfilled`
                        );
                        return 'conditions-fulfilled';
                    } else {
                        log(
                            'info',
                            `${this.id}: Has not achieved amount to fulfill, farming now`
                        );
                        return 'farm';
                    }
                } else {
                    log(
                        'info',
                        `${this.id}: First time farming in time window, farming now`
                    );
                    return 'farm';
                }
            } else {
                /**
                 * Is not in time window.
                 */
                log(
                    'info',
                    `${this.id}: Current date is not in the given time window, not farming`
                );
                return 'conditions-fulfilled';
            }
        } else {
            /**
             * Check if the condition has a started date set.
             */
            if (!this.conditions.started) {
                log('info', `${this.id}: No started date set, farming now`);

                /**
                 * Set the started date.
                 */
                this.conditions.started = getCurrentDate();
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
                     * Check if its reset time.
                     */
                    if (
                        (this.conditions.condition.type === 'weekly' &&
                            remainingDaysInWeek() === 0) ||
                        (this.conditions.condition.type === 'monthly' &&
                            remainingDaysInMonth() === 0)
                    ) {
                        /**
                         * Has reached its reset.
                         */
                        if (this.conditions.condition.repeating) {
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
                            this.conditions.fulfilled = getCurrentDate();
                            return 'conditions-fulfilled';
                        }
                    } else {
                        /**
                         * Still time to farm, not at reset point.
                         */
                        if (this.conditions.condition.amount) {
                            log(
                                'info',
                                `${this.id}: Checking if amount to fulfilled has been achieved`
                            );

                            const amountToAchieve = combineTimeUnits({
                                hours: this.conditions.condition
                                    .amountToFulfill,
                                minutes: this.conditions.condition.buffer
                            }).asMilliseconds();

                            if (
                                this.conditions.condition.amount >=
                                amountToAchieve
                            ) {
                                log(
                                    'info',
                                    `${this.id}: Achieved amount to fulfill condition, will set fulfilled`
                                );
                                this.conditions.fulfilled = getCurrentDate();
                                return 'conditions-fulfilled';
                            } else {
                                log(
                                    'info',
                                    `${this.id}: Has not achieved amount to fulfill yet, farm now (needs ${amountToAchieve} / has ${this.conditions.condition.amount})`
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

                    if (
                        (this.conditions.condition.type === 'weekly' &&
                            remainingDaysInWeek() === 0) ||
                        (this.conditions.condition.type === 'monthly' &&
                            remainingDaysInMonth() === 0)
                    ) {
                        /**
                         * Has reached its reset.
                         */
                        if (this.conditions.condition.repeating) {
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
                            this.conditions.fulfilled = getCurrentDate();
                            return 'conditions-fulfilled';
                        }
                    } else {
                        log(
                            'info',
                            `${this.id}: Not able to reset yet, set fulfilled`
                        );
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
    private async farmingSchedule(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (
                this.status === 'checking' ||
                this.status === 'attention-required'
            ) {
                resolve();
            }

            /**
             * Check for conditions.
             */
            switch (await this.conditionCheck()) {
                case 'conditions-fulfilled':
                    await this.restartScheduler();

                    log(
                        'info',
                        `${this.id}: Condition fulfilled, will not farm`
                    );
                    this.updateStatus('condition-fulfilled');
                    resolve();
                    break;

                case 'farm':
                    try {
                        this.createCheckerWindow()
                            .then(async (window) => {
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
                            .then(async () => {
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
                            })
                            .then(() => {
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
                                /**
                                 * For safety, check and destroy any windows left.
                                 */
                                if (
                                    this.status === 'idle' &&
                                    this.getAmountOfWindows() > 0
                                ) {
                                    this.destroyAllWindows();
                                }

                                /**
                                 * Update the conditions.
                                 */
                                this.updateConditions();

                                log(
                                    'info',
                                    `${this.id}: Finished schedule check`
                                );
                                resolve();
                            })
                            .catch((err) => {
                                log(
                                    'error',
                                    `${this.id}: Error occurred while checking the farm. ${err}`
                                );
                                this.updateStatus('attention-required');

                                reject();
                            });
                    } catch (error) {
                        log(
                            'error',
                            `${this.id}: Schedule crashed, could be from quitting the app, error: ${error}`
                        );
                    }
            }
        });
    }

    /**
     * Cancel the farming schedule if it's running.
     */
    private cancelFarmingSchedule(): void {
        if (this.runningSchedule) {
            this.scheduler.stopAll();
            this.updateConditions();
            this.timer.stopTimer();

            this.runningSchedule?.cancel();
            this.runningSchedule = undefined;

            log('info', `${this.id}: Canceled farming schedule`);
        }
    }
}
