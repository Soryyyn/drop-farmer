import { FileNames } from '@main/common/constants';
import { app } from 'electron';
import { join } from 'path';
import { createLogger, format, transports } from 'winston';

const filePath =
    process.env.NODE_ENV === 'production'
        ? join(app.getPath('userData'), FileNames.LogFileName)
        : join(__dirname, '../../', FileNames.LogFileName);

const logger = createLogger({
    transports: [
        new transports.File({
            filename: filePath,
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

/**
 * Create a log with a level and msg.
 */
export function log(level: string, msg: any) {
    logger.log(level, msg);
}
