import { Channels } from "../common/channels";
import { sendOneWay } from "./ipc";
import { getMainWindow } from "./windows";

/**
 * Send a new toast to the renderer.
 *
 * @param {ToastNotification} toast Toast notification data.
 */
export function sendToast(toast: ToastNotification) {
    sendOneWay(getMainWindow(), Channels.toast, {
        id: toast.id,
        type: toast.type,
        body: toast.body,
        duration: toast.duration
    });
}