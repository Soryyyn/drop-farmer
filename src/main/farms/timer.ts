import { Timer } from "timer-node";
import { log } from "../util/logger";

/**
 * The timer class which handles the uptime tracking of the app or farm.
 */
export class UptimeTimer {
    private _timer = new Timer();
    private _timerName: string;
    private _amount: number = 0;

    constructor(timerName: string) {
        this._timerName = timerName;
    }

    /**
     * Stop the timer if it's running.
     */
    stopTimer(): void {
        if (this._timer.isRunning()) {
            this._amount += this._timer.ms();

            this._timer.stop();
            log("MAIN", "DEBUG", `${this._timerName}: stopped`);
        }
    }

    /**
     * Pause the timer.
     */
    pauseTimer(): void {
        if (this._timer.isRunning()) {
            this._timer.pause();
            log("MAIN", "DEBUG", `${this._timerName}: paused`);
        }
    }

    /**
     * Start or resume the timer if it's paused.
     */
    startTimer(): void {
        if (this._timer.isPaused()) {
            this._timer.resume();
            log("MAIN", "DEBUG", `${this._timerName}: resumed`);
        } else if (this._timer.isStopped() || !this._timer.isStarted()) {
            this._timer.start();
            log("MAIN", "DEBUG", `${this._timerName}: started`);
        }
    }

    /**
     * Returns the amount of time which is saved in the `_amount` attribute.
     */
    getAmount(): number {
        return this._amount;
    }

    /**
     * The timer amount to set.
     *
     * @param {number} amount The amount of time to set.
     */
    setAmount(amount: number): void {
        this._amount = amount;
    }
}
