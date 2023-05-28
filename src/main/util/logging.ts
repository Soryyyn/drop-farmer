import { FileNames } from '@main/util/constants';
import { createLogger, format, transports } from 'winston';
import { getPathForFile } from './files';

const logger = createLogger({
    transports: [
        new transports.File({
            filename: getPathForFile(FileNames.LogFileName),
            format: format.combine(
                format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
                format.printf(
                    ({ level, message, timestamp }) =>
                        `${timestamp} ${level}: ${message}`
                )
            )
        }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
                format.printf(
                    ({ level, message, timestamp }) =>
                        `${timestamp} ${level}: ${message}`
                )
            )
        })
    ]
});

type LogLevel = 'info' | 'warn' | 'debug' | 'error' | 'fatal';

/**
 * Create a log with a level and msg.
 */
export function log(level: LogLevel, msg: any) {
    logger.log({ level: level, message: msg });
}
