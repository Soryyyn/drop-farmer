import PQueue from 'p-queue';
import { TASK_QUEUE_CONCURRENCY, TASK_QUEUE_LOW_PRIO } from './constants';
import { LogLevel, log } from './logging';

const taskQueue = new PQueue({
    concurrency: TASK_QUEUE_CONCURRENCY,
    autoStart: true
});

/**
 * Add a new task to the queue.
 * By default the task has a low priority.
 */
export function addToQueue(
    fn: (...args: any[]) => void | Promise<void>,
    priority: number = TASK_QUEUE_LOW_PRIO
) {
    taskQueue.add(fn, {
        priority
    });
}

export function clearQueue() {
    taskQueue.clear();
    log(LogLevel.Info, 'Cleared queue');
}

export function pauseQueue() {
    taskQueue.pause();
    log(LogLevel.Info, `Paused queue`);
}

export function resumeQueue() {
    if (!taskQueue.isPaused) {
        return;
    }

    taskQueue.start();
    log(
        LogLevel.Info,
        `Resumed queue (pending: ${taskQueue.pending}, size: ${taskQueue.size})`
    );
}

taskQueue.on('add', () =>
    log(
        LogLevel.Info,
        `Added new task to queue (pending: ${taskQueue.pending}, size: ${taskQueue.size})`
    )
);

taskQueue.on('idle', () =>
    log(
        LogLevel.Info,
        `Finished processing all tasks in queue (pending: ${taskQueue.pending}, size: ${taskQueue.size})`
    )
);

taskQueue.on('error', (error: unknown) =>
    log(
        LogLevel.Error,
        `Error when processing task (pending: ${taskQueue.pending}, size: ${taskQueue.size}), error: ${error}`
    )
);
