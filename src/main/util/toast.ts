import { IpcChannels } from '@main/common/constants';
import { sendOneWay } from '@main/electron/ipc';

/**
 * When a toast needs to be displayed right at app start, the window doesn't
 * exist yet, so the toast has nowhere to go.
 * The toast then goes into the backlog, and will fire once the window has
 * finished initialization.
 *
 * Ex. when the settings have migrated to a never version, the settings should
 * be redone (ideally they shouldn't be changed tho).
 */
const toastBacklog: (BasicToast | PromiseToast | ForcedTypeToast)[] = [];

/**
 * Send a toast to the frontend.
 */
export function sendToast(
    toast: Toast,
    callback?: () => void,
    promise?: Promise<any>
): void {
    /**
     * Forced type toast.
     */
    if (
        toast.type === 'success' ||
        toast.type === 'error' ||
        toast.type === 'loading'
    ) {
        sendOneWay(IpcChannels.toast, toast);
    }

    /**
     * Basic toast which can end on success or error based on callback.
     */
    if (toast.type === 'basic') {
        try {
            callback!();
            sendOneWay(IpcChannels.toast, { ...toast, type: 'success' });
        } catch (error) {
            sendOneWay(IpcChannels.toast, { ...toast, type: 'error' });
        }
    }

    /**
     * Toast which reacts based on a promise given.
     */
    if (toast.type === 'promise') {
        sendOneWay(IpcChannels.toast, { ...toast, type: 'loading' });

        promise!
            .then(() =>
                sendOneWay(IpcChannels.toast, { ...toast, type: 'success' })
            )
            .catch((error) =>
                sendOneWay(IpcChannels.toast, { ...toast, type: 'error' })
            );
    }
}
