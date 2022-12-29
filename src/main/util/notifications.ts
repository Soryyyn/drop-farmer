import { NativeImage, nativeImage, Notification } from 'electron';
import { resolve } from 'path';

function getIcon(): NativeImage {
    const iconPath = 'resources/icon';

    if (process.platform === 'win32') {
        return nativeImage.createFromPath(
            resolve(__dirname, `${iconPath}.ico`)
        );
    } else {
        return nativeImage.createFromPath(
            resolve(__dirname, `${iconPath}.png`)
        );
    }
}

/**
 * Create a native notification with a title and body.
 */
export function createNotification(title: string, body: string): void {
    const notif = new Notification({
        icon: getIcon(),
        title: title,
        body: body,
        timeoutType: 'default'
    });
    notif.show();
}
