import CrontabManager from 'cron-job-manager';
import { LogLevel, log } from './logging';

export enum CronKey {
    InternetConnection = 'internet-connection'
}

/**
 * The cron job manager which keeps track of all cron schedules.
 */
const manager = new CrontabManager();

export function createCronSchedule(
    key: CronKey,
    schedule: string,
    autoStart: boolean,
    task: () => void | Promise<void>
) {
    manager.add(key, schedule, task, {
        start: autoStart,
        onComplete: () => log(LogLevel.Info, `Completed cron task on ${key}`)
    });

    log(
        LogLevel.Info,
        `Added new cron schedule ${key} with schedule ${schedule}`
    );
}

export function updateCronSchedule(key: CronKey, schedule: string) {
    manager.update(key, schedule);
    log(LogLevel.Info, `Updated cron schedule ${key} to ${schedule}`);
}

export function stopCronSchedule(key: CronKey) {
    manager.stop(key);
    log(LogLevel.Info, `Stopped cron schedule ${key}`);
}

export function resumeCronSchedule(key: CronKey) {
    manager.start(key);
    log(LogLevel.Info, `Resumed cron schedule ${key}`);
}

export function stopAllCronSchedules() {
    manager.stopAll();
    log(LogLevel.Info, 'Stopped all cron schedules');
}

export function resumeAllCronSchedules() {
    manager.startAll();
    log(LogLevel.Info, 'Resumed all cron schedules');
}
