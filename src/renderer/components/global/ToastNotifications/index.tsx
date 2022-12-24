import { useHandleOneWay } from '@hooks/useHandleOneWay';
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ToastNotifications() {
    /**
     * Handle a toast success notification.
     */
    useHandleOneWay(api.channels.toastSuccess, null, (event, toastSettings) => {
        toast.success(toastSettings.text, {
            id: toastSettings.id,
            duration: toastSettings.duration
        });
    });

    /**
     * Handle an error toast notification.
     */
    useHandleOneWay(api.channels.toastError, null, (event, toastSettings) => {
        toast.error(toastSettings.text, {
            id: toastSettings.id,
            duration: toastSettings.duration
        });
    });

    /**
     * Handle a loading toast notification.
     */
    useHandleOneWay(api.channels.toastLoading, null, (event, toastSettings) => {
        toast.loading(toastSettings.text, {
            id: toastSettings.id,
            duration: toastSettings.duration
        });
    });

    /**
     * Handle a forced type toast notification.
     */
    useHandleOneWay(
        api.channels.toastForcedType,
        null,
        (event, toastSettings: ForcedTypeToast) => {
            if (toastSettings.type === 'success')
                toast.success(toastSettings.text, {
                    id: toastSettings.id,
                    duration: toastSettings.duration
                });
            else if (toastSettings.type === 'error')
                toast.error(toastSettings.text, {
                    id: toastSettings.id,
                    duration: toastSettings.duration
                });
            else
                toast.loading(toastSettings.text, {
                    id: toastSettings.id,
                    duration: toastSettings.duration
                });
        }
    );

    return (
        <Toaster
            position={'bottom-center'}
            toastOptions={{
                style: {
                    minWidth: '450px',
                    background: 'rgb(41 44 63 / 0.95)',
                    boxShadow:
                        '0 20px 25px -5px rgb(41 44 63 / 0.25), 0 8px 10px -6px rgb(41 44 63 / 0.25)',
                    backdropFilter: 'blur(40px)',
                    color: 'rgb(200, 222, 245)',
                    padding: '0.75rem',
                    borderRadius: '0.75rem'
                },
                success: {
                    iconTheme: {
                        primary: '#21db87',
                        secondary: 'rgb(41 44 63 / 0.95)'
                    }
                },
                loading: {
                    iconTheme: {
                        primary: '#c8def5',
                        secondary: 'rgb(41 44 63 / 0.95)'
                    }
                },
                error: {
                    iconTheme: {
                        primary: '#e74b65',
                        secondary: 'rgb(41 44 63 / 0.95)'
                    }
                }
            }}
        />
    );
}
