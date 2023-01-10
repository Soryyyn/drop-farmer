import { IpcChannels, Schedules } from '@main/common/constants';
import { sendOneWay } from '@main/electron/ipc';
import {
    createWindow,
    destroyWindow,
    hideWindow,
    showWindow
} from '@main/electron/windows';
import { log } from '@main/util/logging';
import CrontabManager from 'cron-job-manager';
import { doesSettingExist, getSetting, setSetting } from '../util/settings';
import { Timer } from './timer';

export default abstract class FarmTemplate {
    id: string;
    shown: string;
    url: string;

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

    constructor(id: string, shown: string, url: string) {
        this.id = id;
        this.shown = shown;
        this.url = url;

        this.timer = new Timer(id);
    }

    initialize(): void {
        /**
         * Set the farm settings inside the store if they don't exist.
         */
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

        if (getSetting('application', 'showWindowsForLogin')?.value as boolean)
            this.windowsShownByDefault === true;
        else this.windowsShownByDefault === false;

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

        /**
         * Set the amount of uptime for the farm.
         */
        // this.timer.amount

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
            shown: this.shown,
            status: this.status,
            schedule: this.schedule,
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

    protected createCheckerWindow(): Promise<Electron.BrowserWindow> {
        return new Promise<Electron.BrowserWindow>((resolve, reject) => {
            if (this.checker) {
                resolve(this.checker);
            } else {
                createWindow(
                    this.url,
                    this.windowsShownByDefault || this.windowsCurrentlyShown
                )
                    .then((window: Electron.BrowserWindow) => {
                        window.on('close', () => {
                            this.checker = undefined;
                            destroyWindow(window);
                        });

                        this.checker = window;
                        resolve(this.checker);
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
                .then((window: Electron.BrowserWindow) => {
                    window.on('close', () => {
                        this.destroyWindowFromArray(array, window);
                        destroyWindow(window);
                    });

                    array.push(window);
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
                    this.updateStatus('checking');

                    /**
                     * Pause timer if it is running.
                     */
                    this.timer.pauseTimer();

                    await this.login(window);
                    if (this.farmers.length > 0) {
                        await this.stillFarming(window);
                    }
                    await this.startFarming(window);

                    /**
                     * If the status is farming, then start/resume the timer.
                     */
                    this.timer.startTimer();
                })
                .then(() => {
                    this.destroyChecker();

                    /**
                     * If the farm has been disabled mid-check, set the status
                     * to disable once again to be sure.
                     */
                    if (!this.enabled) this.updateStatus('disabled');

                    this.updateStatus(this.status);
                })
                .catch((err) => {
                    log(
                        'error',
                        `${this.id}: Error occurred while checking the farm. ${err}`
                    );
                    this.updateStatus('attention-required');
                });
        }
    }
}
