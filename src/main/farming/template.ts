import { IpcChannels, Schedules } from '@main/common/constants';
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
    getCurrentDate,
    getDate,
    remainingDaysInMonth,
    remainingDaysInWeek,
    stringToDate
} from '@main/util/calendar';
import { log } from '@main/util/logging';
import { waitForTimeout } from '@main/util/puppeteer';
import { updateFarmStatistic } from '@main/util/statistics';
import CrontabManager from 'cron-job-manager';
import {
    deleteSetting,
    getOrSetSetting,
    getSettings,
    updateSetting
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

    initialize(): void {
        this.createOrSetFarmSettings();

        /**
         * Set the initial status based on factors.
         */
        if (!this.enabled) {
            this.status = 'disabled';
        } else if (this.conditions.fulfilled) {
            this.status = 'condition-fulfilled';
        } else {
            this.status = 'idle';
        }

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
        const farmSettings = getSettings()[this.id];

        /**
         * Apply default settings.
         */
        farmSettings.forEach((setting) => {
            switch (setting.id) {
                /**
                 * Default farm settings.
                 */
                case 'enabled':
                    (setting.value as boolean) ? this.enable() : this.disable();
                    break;
                case 'schedule':
                    this.updateSchedule(
                        (setting as NumberSetting).value as number
                    );
                    break;
                case 'url':
                    this.url = (setting as TextSetting).value as string;
                    break;

                /**
                 * Condition settings.
                 */
                case 'condition-started':
                    if (this.conditions.condition.type !== 'unlimited') {
                        this.conditions.started = stringToDate(
                            setting.value as string
                        );
                    } else {
                        deleteSetting(this.id, 'condition-started');
                    }
                    break;
                case 'condition-fulfilled':
                    if (this.conditions.condition.type !== 'unlimited') {
                        this.conditions.fulfilled = stringToDate(
                            setting.value as string
                        );
                    } else {
                        deleteSetting(this.id, 'condition-fulfilled');
                    }
                    break;
                case 'condition-type':
                    this.conditions.condition.type =
                        setting.value as ConditionType;
                    break;
                case 'condition-amount':
                    if (this.conditions.condition.type !== 'unlimited') {
                        this.conditions.condition.amount =
                            setting.value as number;
                    } else {
                        deleteSetting(this.id, 'condition-amount');
                    }
                    break;
                case 'condition-amountToFulfill':
                    if (this.conditions.condition.type !== 'unlimited') {
                        this.conditions.condition.amountToFulfill =
                            setting.value as number;
                    } else {
                        deleteSetting(this.id, 'condition-amountToFulfill');
                    }
                    break;
                case 'condition-buffer':
                    if (this.conditions.condition.type !== 'unlimited') {
                        this.conditions.condition.buffer =
                            setting.value as number;
                    } else {
                        deleteSetting(this.id, 'condition-buffer');
                    }
                    break;
                case 'condition-repeating':
                    if (
                        this.conditions.condition.type !== 'unlimited' &&
                        this.conditions.condition.type !== 'timeWindow'
                    ) {
                        this.conditions.condition.repeating =
                            setting.value as boolean;
                    } else {
                        deleteSetting(this.id, 'condition-repeating');
                    }
                    break;
                case 'condition-from':
                    if (this.conditions.condition.type === 'timeWindow') {
                        this.conditions.condition.from = stringToDate(
                            setting.value as string
                        );
                    } else {
                        deleteSetting(this.id, 'condition-from');
                    }
                    break;
                case 'condition-to':
                    if (this.conditions.condition.type === 'timeWindow') {
                        this.conditions.condition.to = stringToDate(
                            setting.value as string
                        );
                    } else {
                        deleteSetting(this.id, 'condition-to');
                    }
                    break;
            }
        });

        /**
         * Create the conditional settings needed, because maybe the type changed.
         */
        this.createOrSetConditionSettings();

        log('info', `${this.id}: Applied new settings`);
    }

    /**
     * Create all settings depending on the farm type.
     */
    createOrSetFarmSettings(): void {
        this.enabled = (
            getOrSetSetting(this.id, 'enabled', {
                id: 'enabled',
                shown: 'Farm enabled',
                desc: 'Enable or disable this farm.',
                value: this.enabled,
                default: false
            }) as BoolishSetting
        ).value;

        this.schedule = (
            getOrSetSetting(this.id, 'schedule', {
                id: 'schedule',
                shown: 'Farming schedule',
                desc: 'The schedule (in minutes) on which drop-farmer will check if farming is possible.',
                value: this.schedule,
                default: 30,
                max: 60,
                min: 1
            }) as NumberSetting
        ).value;

        this.url = (
            getOrSetSetting(this.id, 'url', {
                id: 'url',
                shown: 'Checking URL',
                desc: 'The URL the farm will check if it can farm.',
                value: this.url,
                default: this.url,
                disabled: true
            }) as TextSetting
        ).value;

        this.windowsShownByDefault = (
            getOrSetSetting(
                'application',
                'showWindowsForLogin'
            ) as BoolishSetting
        ).value
            ? true
            : false;

        this.conditions.condition.type = (
            getOrSetSetting(this.id, 'condition-type', {
                id: 'condition-type',
                shown: 'Condition type',
                desc: 'The type will control how the farm will when to farm.',
                disabled: false,
                value: this.conditions.condition.type,
                default: 'unlimited',
                options: [
                    {
                        display: 'Unlimited',
                        value: 'unlimited'
                    },
                    {
                        display: 'Weekly',
                        value: 'weekly'
                    },
                    {
                        display: 'Monthly',
                        value: 'Monthly'
                    },
                    {
                        display: 'From ... to ...',
                        value: 'timeWindow'
                    }
                ]
            }) as SelectionSetting
        ).value as ConditionType;

        this.createOrSetConditionSettings();
    }

    /**
     * Load / or create conditions based on condition type.
     */
    createOrSetConditionSettings(): void {
        const conditionType = this.conditions.condition.type;

        if (
            conditionType === 'monthly' ||
            conditionType === 'weekly' ||
            conditionType === 'timeWindow'
        ) {
            /**
             * Set the started or fulfilled condition if it is set in the settings.
             */
            const started = (
                getOrSetSetting(this.id, 'condition-started', {
                    id: 'condition-started',
                    value: ''
                }) as TextSetting
            ).value;

            if (started !== '') {
                this.conditions.started = getDate(started);
            }

            const fulfilled = (
                getOrSetSetting(this.id, 'condition-fulfilled', {
                    id: 'condition-fulfilled',
                    value: ''
                }) as TextSetting
            ).value;

            if (fulfilled !== '') {
                this.conditions.fulfilled = getDate(fulfilled);
            }

            this.conditions.condition.amount = (
                getOrSetSetting(this.id, 'condition-amount', {
                    id: 'condition-amount',
                    value: 0
                }) as NumberSetting
            ).value;

            this.conditions.condition.amountToFulfill = (
                getOrSetSetting(this.id, 'condition-amountToFulfill', {
                    id: 'condition-amountToFulfill',
                    shown: 'Amount to fulfill condition',
                    desc: 'The amount of hours the farm needs to farm before the stopping/reset condition has been fulfilled.',
                    value: this.conditions.condition.amountToFulfill ?? 4,
                    default: 4,
                    disabled: false,
                    min: 1,
                    max: 100
                }) as NumberSetting
            ).value;

            this.conditions.condition.buffer = (
                getOrSetSetting(this.id, 'condition-buffer', {
                    id: 'condition-buffer',
                    shown: 'Buffer',
                    desc: 'The buffer (in minutes) controls how much longer the farm will farm as a buffer because drops may not exactly happen on the hour.',
                    value: this.conditions.condition.buffer ?? 30,
                    default: 30,
                    disabled: false,
                    min: 0,
                    max: 60
                }) as NumberSetting
            ).value;

            /**
             * Type specific condition settings.
             */
            if (conditionType === 'weekly' || conditionType === 'monthly') {
                this.conditions.condition.repeating = (
                    getOrSetSetting(this.id, 'condition-repeating', {
                        id: 'condition-repeating',
                        shown: 'Repeat after timeframe reset',
                        desc: 'If the farm should repeat the condition after the timeframe is fulfilled.',
                        value: this.conditions.condition.repeating ?? true,
                        default: true,
                        disabled: false
                    }) as BoolishSetting
                ).value;
            } else if (conditionType === 'timeWindow') {
                const from = (
                    getOrSetSetting(this.id, 'condition-from', {
                        id: 'condition-from',
                        shown: 'Starting date of condition',
                        desc: "The starting date; From when on the farm can farm and try to fulfill it's condition.",
                        value: (this.conditions.condition.from as string) ?? '',
                        default: '',
                        disabled: false
                    }) as TextSetting
                ).value;

                if (from !== '') {
                    this.conditions.condition.from = stringToDate(from);
                }

                const to = (
                    getOrSetSetting(this.id, 'condition-to', {
                        id: 'condition-to',
                        shown: 'Ending date of condition',
                        desc: "The ending date; When the farm should stop trying to fulfill it's condition",
                        value: (this.conditions.condition.to as string) ?? '',
                        default: '',
                        disabled: false
                    }) as TextSetting
                ).value;

                if (to !== '') {
                    this.conditions.condition.to = stringToDate(to);
                }
            }
        }
    }

    updateConditionValues(): void {
        if (this.conditions.condition.type !== 'unlimited') {
            if (this.conditions.condition.amount)
                updateSetting(this.id, 'condition-amount', {
                    id: 'condition-amount',
                    value: this.conditions.condition.amount
                });

            if (this.conditions.started)
                updateSetting(this.id, 'condition-started', {
                    id: 'condition-started',
                    value: dateToISOString(this.conditions.started)
                });

            if (this.conditions.fulfilled)
                updateSetting(this.id, 'condition-fulfilled', {
                    id: 'condition-fulfilled',
                    value: dateToISOString(this.conditions.fulfilled)
                });
        }

        log('info', `${this.id}: Updated condition values`);
    }

    resetConditions(): void {
        this.conditions.started = undefined;
        updateSetting(this.id, 'condition-started', {
            id: 'condition-started',
            value: ''
        });

        this.conditions.fulfilled = undefined;
        updateSetting(this.id, 'condition-fulfilled', {
            id: 'condition-fulfilled',
            value: ''
        });

        if (this.conditions.condition.type !== 'unlimited') {
            this.conditions.condition.amount = undefined;
            updateSetting(this.id, 'condition-amount', {
                id: 'condition-amount',
                value: 0
            });
        }

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

    async restartScheduler(withStatus?: FarmStatus, steps?: () => void) {
        this.timer.stopTimer();
        await this.addUptimeAmount();
        await this.destroyAllWindows();

        this.scheduler.stopAll();
        if (steps) Promise.all([steps()]);
        this.scheduler.startAll();

        if (this.status === 'disabled') {
            this.updateStatus('disabled');
        } else {
            this.updateStatus(withStatus ?? 'idle');
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
    private async conditionCheck(): Promise<ConditionCheckReturn> {
        this.timer.stopTimer();
        await this.addUptimeAmount();

        /**
         * Check if the farm is set to unlimited farming.
         */
        if (this.conditions.condition.type === 'unlimited') {
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
                this.conditions.started = getCurrentDate();
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
                            this.updateConditionValues();
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
                            this.updateConditionValues();
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
        if (
            this.status !== 'checking' &&
            this.status !== 'attention-required'
        ) {
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
                    break;
                case 'farm':
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
                        .catch((err) => {
                            log(
                                'error',
                                `${this.id}: Error occurred while checking the farm. ${err}`
                            );
                            this.updateStatus('attention-required');
                        })
                        .finally(() => {
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

                            this.updateConditionValues();
                        });

                    break;
            }

            /**
             * For safety, check and destroy any windows left.
             */
            if (this.status === 'idle' && this.getAmountOfWindows() > 0) {
                await this.destroyAllWindows();
            }
        }
    }
}
