import { Channels } from "../common/channels";
import { sendOneWay } from "../electron/ipc";
import { getMainWindow } from "../electron/windows";

/**
 * Send a toast to the renderer.
 * Try-catch the callback to either send a error or success toast.
 *
 * @param {BasicToast} toast Toast data to send.
 * @param {() => void} callback The callback to call in the try block.
 */
export function sendBasicToast(toast: BasicToast, callback: () => void): void {
    try {
        sendOneWay(getMainWindow(), Channels.toastSuccess, {
            id: toast.id,
            text: toast.textOnSuccess,
            duration: toast.duration
        });
        callback();
    } catch (err) {
        sendOneWay(getMainWindow(), Channels.toastError, {
            id: toast.id,
            text: `${toast.textOnError} ${err}`,
            duration: toast.duration
        });
    }
}

/**
 * Send a promise-based toast to the renderer.
 *
 * @param {PromiseToast} toast Toast data.
 * @param {Promise<any>} promise The promise to check for.
 */
export function sendPromiseToast(
    toast: PromiseToast,
    promise: Promise<any>
): void {
    sendOneWay(getMainWindow(), Channels.toastLoading, {
        id: toast.id,
        text: toast.textOnLoading,
        duration: Infinity
    });

    promise
        .then(() => {
            sendOneWay(getMainWindow(), Channels.toastSuccess, {
                id: toast.id,
                text: toast.textOnSuccess,
                duration: toast.duration
            });
        })
        .catch((err) => {
            sendOneWay(getMainWindow(), Channels.toastError, {
                id: toast.id,
                text: `${toast.textOnError} ${err}`,
                duration: toast.duration
            });
        });
}

/**
 * Send a toast with a forced type (either success or error) to the renderer.
 *
 * @param {ForcedTypeToast} toast Toast data.
 */
export function sendForcedTypeToast(toast: ForcedTypeToast): void {
    sendOneWay(getMainWindow(), Channels.toastForcedType, {
        id: toast.id,
        text: toast.text,
        duration: toast.duration,
        type: toast.type
    });
}
