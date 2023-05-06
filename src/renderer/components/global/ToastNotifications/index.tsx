import { Toast } from '@df-types/toast.types';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useHandleOneWay } from '@renderer/chooks/useHandleOneWay';
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Icon from '../Icon';

type ToastContentProps = {
    label: string;
    onDismiss: () => void;
};

function ToastContent({ label, onDismiss }: ToastContentProps) {
    return (
        <div className="flex flex-row gap-4 items-center w-full">
            <p>{label}</p>
            <button
                onClick={onDismiss}
                className="ml-auto aspect-square h-min bg-pepper-400 hover:bg-pepper-500 flex items-center justify-center p-1 rounded-md text-snow-300 active:outline outline-2 outline-offset-2 outline-snow-300/50 transition-all"
            >
                <Icon sprite={faXmark} size="1x" />
            </button>
        </div>
    );
}

export default function ToastNotifications() {
    useHandleOneWay({
        channel: api.channels.toast,
        callback: (event, receivedToast: Toast) => {
            if (receivedToast.type === 'success') {
                toast.success(
                    <ToastContent
                        label={receivedToast.textOnSuccess!}
                        onDismiss={() => toast.dismiss(receivedToast.id)}
                    />,
                    {
                        id: receivedToast.id,
                        duration: receivedToast.duration
                    }
                );
            } else if (receivedToast.type === 'error') {
                toast.error(
                    <ToastContent
                        label={receivedToast.textOnError!}
                        onDismiss={() => toast.dismiss(receivedToast.id)}
                    />,
                    {
                        id: receivedToast.id,
                        duration: receivedToast.duration
                    }
                );
            } else if (receivedToast.type === 'loading') {
                toast.loading(
                    <ToastContent
                        label={receivedToast.textOnLoading!}
                        onDismiss={() => toast.dismiss(receivedToast.id)}
                    />,
                    {
                        id: receivedToast.id,
                        duration: receivedToast.duration
                    }
                );
            }
        }
    });

    return (
        <Toaster
            position={'bottom-center'}
            toastOptions={{
                style: {
                    minWidth: '450px',
                    textAlign: 'left',
                    background: 'rgb(21 22 32)',
                    boxShadow:
                        '0 20px 25px -5px rgb(21 22 32 / 0.25), 0 8px 10px -6px rgb(21 22 32 / 0.25)',
                    color: 'rgb(186 213 241)',
                    padding: '0.75rem',
                    borderRadius: '0.75rem'
                },
                success: {
                    iconTheme: {
                        primary: '#21db87',
                        secondary: 'rgb(21 22 32 / 0.95)'
                    }
                },
                loading: {
                    iconTheme: {
                        primary: '#BAD5F1',
                        secondary: 'rgb(21 22 32 / 0.95)'
                    }
                },
                error: {
                    iconTheme: {
                        primary: '#e74b65',
                        secondary: 'rgb(21 22 32 / 0.95)'
                    }
                }
            }}
        />
    );
}
