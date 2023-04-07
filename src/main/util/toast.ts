import { IpcChannels, Toast as ToastId } from '@main/common/constants';
import { sendOneWay } from '@main/electron/ipc';

type ToastType = 'success' | 'error' | 'loading' | 'basic' | 'promise';

type Toast = {
    type: ToastType;
    id: ToastId;
    duration: number;
    textOnSuccess?: string;
    textOnError?: string;
    textOnLoading?: string;
};

/**
 * Send a toast to the frontend.
 */
export function sendToast({
    toast,
    callback,
    promise
}: {
    toast: Toast;
    callback?: () => void;
    promise?: Promise<any>;
}): void {
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
            sendOneWay(IpcChannels.toast, {
                ...toast,
                type: 'error',
                textOnError: `${toast.textOnError} (${error})`
            });
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
            .catch((error: Error) =>
                sendOneWay(IpcChannels.toast, {
                    ...toast,
                    type: 'error',
                    textOnError: `${toast.textOnError} (${error.message})`
                })
            );
    }
}
