import { Timer } from "timer-node";
import { log } from "./logger";

/**
 * The timer class which handles the uptime tracking of the app or farm.
 */
export class UptimeTimer {
    private _timer = new Timer();
    private _timerName: string = "";
    private _amount: number = 0;

    /**
     * Set the timer name.
     *
     * @param {string} name The timer name.
     */
    setTimerName(name: string): void {
        this._timerName = name;
    }

    /**
     * Stop the timer if it's running.
     */
    stopTimer(): void {
        if (this._timer.isRunning()) {
            this._timer.stop();
            this._amount += this._timer.ms();
            log("MAIN", "INFO", `${this._timerName}: stopped`);
        }
    }

    /**
     * Pause the timer.
     */
    pauseTimer(): void {
        if (this._timer.isRunning()) {
            this._timer.pause();
            log("MAIN", "INFO", `${this._timerName}: paused`);
        }
    }

    /**
     * Start or resume the timer if it's paused.
     */
    startTimer(): void {
        if (this._timer.isPaused()) {
            this._timer.resume();
            log("MAIN", "INFO", `${this._timerName}: resumed`);
        } else if (this._timer.isStopped()) {
            this._timer.start();
            log("MAIN", "INFO", `${this._timerName}: started`);
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