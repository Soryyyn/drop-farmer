import { Notification } from "electron";

/**
 * Display a native notification.
 *
 * @param {string} title The title of the notification.
 * @param {string} body The body text of the notification.
 */
export function showNotification(title: string, body: string): void {
    new Notification({
        title: title,
        body: body
    }).show();
}