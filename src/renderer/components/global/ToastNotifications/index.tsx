import { useHandleOneWay } from "@hooks/useHandleOneWay";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ToastNotifications() {
    /**
     * Handle a toast success notification.
     */
    useHandleOneWay(
        window.api.channels.toastSuccess,
        null,
        (event, toastSettings) => {
            toast.success(toastSettings.text, {
                id: toastSettings.id,
                duration: toastSettings.duration
            });
        }
    );

    /**
     * Handle an error toast notification.
     */
    useHandleOneWay(
        window.api.channels.toastError,
        null,
        (event, toastSettings) => {
            toast.error(toastSettings.text, {
                id: toastSettings.id,
                duration: toastSettings.duration
            });
        }
    );

    /**
     * Handle a loading toast notification.
     */
    useHandleOneWay(
        window.api.channels.toastLoading,
        null,
        (event, toastSettings) => {
            toast.loading(toastSettings.text, {
                id: toastSettings.id,
                duration: toastSettings.duration
            });
        }
    );

    /**
     * Handle a forced type toast notification.
     */
    useHandleOneWay(
        window.api.channels.toastForcedType,
        null,
        (event, toastSettings) => {
            if (toastSettings.type === "error")
                toast.success(toastSettings.text, {
                    id: toastSettings.id,
                    duration: toastSettings.duration
                });
            else
                toast.error(toastSettings.text, {
                    id: toastSettings.id,
                    duration: toastSettings.duration
                });
        }
    );

    return (
        <Toaster
            position={"bottom-center"}
            toastOptions={{
                style: {
                    minWidth: "450px",
                    background: "rgba(16, 18, 27, 0.75)",
                    border: "1px solid rgba(16, 18, 27, 0.1)",
                    boxShadow: "5px 5px 15px rgba(16, 18, 27, 0.4)",
                    backdropFilter: "blur(20px)",
                    color: "rgb(200, 222, 245)",
                    padding: "0.75rem"
                },
                success: {
                    iconTheme: {
                        primary: "rgb(33, 219, 135)",
                        secondary: "rgb(16, 18, 27)"
                    }
                },
                loading: {
                    iconTheme: {
                        primary: "rgb(200, 222, 245)",
                        secondary: "rgb(16, 18, 27)"
                    }
                },
                error: {
                    iconTheme: {
                        primary: "rgb(231, 75, 101)",
                        secondary: "rgb(16, 18, 27)"
                    }
                }
            }}
        />
    );
}
