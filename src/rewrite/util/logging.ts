import { app } from 'electron';
import { join } from 'path';
import { createLogger, format, transports } from 'winston';
import { LOG_TIMESTAMP } from './constants';
import { isRunningOnProd } from './environment';
import { PredefinedFiles } from './files';

export enum LogLevel {
    Info = 'info',
    Debug = 'debug',
    Error = 'error',
    Warn = 'warn'
}

const filePath = isRunningOnProd()
    ? join(app.getPath('userData'), PredefinedFiles.LogFileName)
    : join(__dirname, '../../', PredefinedFiles.LogFileName);

const logger = createLogger({
    transports: [
        new transports.File({
            filename: filePath,
            format: format.combine(
                format.timestamp({ format: LOG_TIMESTAMP }),
                format.printf(
                    ({ level, message, timestamp }) =>
                        `${timestamp} ${level}: ${message}`
                )
            )
        }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: LOG_TIMESTAMP }),
                format.printf(
                    ({ level, message, timestamp }) =>
                        `${timestamp} ${level}: ${message}`
                )
            )
        })
    ]
});

/**
 * Create a log with a level and msg.
 */
export function log(level: LogLevel, msg: any) {
    logger.log(level, msg);
}
