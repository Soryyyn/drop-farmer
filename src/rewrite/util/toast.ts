import { ToastObject } from '@df-types/toast.types';
import { IpcChannels } from '@main/common/constants';
import { sendOneWay } from '@main/electron/ipc';
import { IPCChannel, sendToRenderer } from '../behaviour/ipc';
import { DEFAULT_TOAST_DURATION } from './constants';

export enum ToastId {
    InternetConnection = 'internet-connection'
}

// type SendToastToRendererProps = {
//     type: 'SUCCESS' | 'FAILURE' | 'LOADING';
//     fn?: () => Promise<any>;
// }

type BasicToast = {
    id: string;
    type: 'SUCCESS' | 'FAILURE';
    text: string;
    textOnSuccess?: never;
    textOnFailure?: never;
    textOnLoading?: never;
    fn?: never;
};

type ExecutionBasedToast = {
    id: string;
    type?: never;
    text?: never;
    textOnSuccess: string;
    textOnFailure: string;
    textOnLoading?: never;
    fn: () => any;
};

type PromiseBasedToast = {
    id: string;
    type?: never;
    text?: never;
    textOnSuccess: string;
    textOnFailure: string;
    textOnLoading?: string;
    fn: Promise<any>;
};

type SendToastToRendererProps =
    | BasicToast
    | ExecutionBasedToast
    | PromiseBasedToast;

export function sendToastToRenderer({
    id,
    type,
    text,
    textOnSuccess,
    textOnFailure,
    textOnLoading,
    fn
}: SendToastToRendererProps) {
    // If the type is defined, no function needs to be executed and the toast is very basic.
    if (type) {
        sendToRenderer(IPCChannel.SendToastToRenderer, {
            id,
            type,
            duration: DEFAULT_TOAST_DURATION,
            text
        });
        return;
    }

    // If fn is a function, the toast will be handled by a try/catch.
    if (typeof fn === 'function') {
        try {
            fn();
            sendToRenderer(IPCChannel.SendToastToRenderer, {
                id,
                type: 'SUCCESS',
                duration: DEFAULT_TOAST_DURATION,
                text: textOnSuccess
            });
        } catch (error) {
            sendToRenderer(IPCChannel.SendToastToRenderer, {
                id,
                type: 'FAILURE',
                duration: DEFAULT_TOAST_DURATION,
                text: textOnFailure
            });
        }
        return;
    }

    // If the function lands here, the given fn is a promise.
    sendToRenderer(IPCChannel.SendToastToRenderer, {
        id,
        type: 'LOADING',
        duration: Infinity,
        text: textOnLoading
    });

    fn.then(() => {
        sendToRenderer(IPCChannel.SendToastToRenderer, {
            id,
            type: 'SUCCESS',
            duration: DEFAULT_TOAST_DURATION,
            text: textOnSuccess
        });
    }).catch(() => {
        sendToRenderer(IPCChannel.SendToastToRenderer, {
            id,
            type: 'FAILURE',
            duration: DEFAULT_TOAST_DURATION,
            text: textOnFailure
        });
    });
}

/**
 * Send a toast to the frontend.
 */
export function sendToast({
    toast,
    callback,
    promise
}: {
    toast: ToastObject;
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
