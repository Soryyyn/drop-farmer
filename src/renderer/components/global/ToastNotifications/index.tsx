import { Toast } from '@df-types/toast.types';
import { useHandleOneWay } from '@hooks/useHandleOneWay';
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ToastNotifications() {
    useHandleOneWay({
        channel: api.channels.toast,
        callback: (event, receivedToast: Toast) => {
            if (receivedToast.type === 'success') {
                toast.success(receivedToast.textOnSuccess!, {
                    id: receivedToast.id,
                    duration: receivedToast.duration
                });
            } else if (receivedToast.type === 'error') {
                toast.error(receivedToast.textOnError!, {
                    id: receivedToast.id,
                    duration: receivedToast.duration
                });
            } else if (receivedToast.type === 'loading') {
                toast.loading(receivedToast.textOnLoading!, {
                    id: receivedToast.id,
                    duration: receivedToast.duration
                });
            }
        }
    });

    return (
        <Toaster
            position={'bottom-center'}
            toastOptions={{
                style: {
                    minWidth: '450px',
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
