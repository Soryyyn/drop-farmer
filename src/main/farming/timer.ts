import { log } from '@main/util/logging';
import { Timer as TimerNode } from 'timer-node';

/**
 * The timer class which handles the uptime tracking of the app or farm.
 */
export class Timer {
    private timer = new TimerNode();
    private timerName: string;
    amount: number = 0;

    constructor(gameId: string) {
        this.timerName = `${gameId} (timer)`;
    }

    stopTimer(): void {
        if (this.timer.isRunning()) {
            this.addBuiltUpTime();

            this.timer.stop();
            log('info', `${this.timerName}: stopped`);
        }
    }

    startTimer(): void {
        this.timer.start();
        log('info', `${this.timerName}: started`);
    }

    private addBuiltUpTime() {
        this.amount = 0;
        this.amount += this.timer.ms();
        this.timer.clear();
    }
}
