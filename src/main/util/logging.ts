import { FileNames } from '@main/common/constants';
import { app } from 'electron';
import { join } from 'path';
import SimpleLogger, { createLogManager } from 'simple-node-logger';

const filePath =
    process.env.NODE_ENV === 'production'
        ? join(app.getPath('userData'), FileNames.LogFileName)
        : join(__dirname, '../../', FileNames.LogFileName);

const logManager = createLogManager();

/**
 * Add a file appender to the logger so it also gets logged to a file.
 */
logManager.createFileAppender({
    logFilePath: filePath,
    timestampFormat: 'DD-MM-YYYY HH:mm:ss.SSS'
});

const logger: SimpleLogger.Logger = logManager.createLogger();

/**
 * Create a log with a level and msg.
 */
export function log(level: SimpleLogger.STANDARD_LEVELS, msg: string) {
    logger.log(level, msg);
}
