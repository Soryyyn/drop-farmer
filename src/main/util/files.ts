import { FileName } from '@main/util/constants';
import { app } from 'electron';
import { join } from 'path';

/**
 * Get the path of the userdata directory.
 */
export function getAppPath() {
    return process.env.NODE_ENV === 'production'
        ? join(app.getPath('userData'))
        : join(__dirname, '../../');
}

/**
 * Get the userdata filepath for a file.
 */
export function getPathForFile(filename: FileName) {
    return join(getAppPath(), filename);
}
