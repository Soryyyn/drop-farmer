import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HashRouter, Route, Routes } from "react-router-dom";
import Dragbar from "./components/Dragbar";
import Home from "./sites/Home";
import styles from "./styles/App.module.scss";

export default function App() {
    /**
     * React to toast signals coming from main.
     */
    useEffect(() => {
        window.api.handleOneWay(window.api.channels.toastSuccess, (event, toastNotif: ToastFromMain) => {
            window.api.log("DEBUG", "Displaying success toast");
            toast.success(toastNotif.text, {
                id: toastNotif.id,
                duration: toastNotif.duration
            });
        });

        window.api.handleOneWay(window.api.channels.toastError, (event, toastNotif: ToastFromMain) => {
            window.api.log("DEBUG", "Displaying error toast");
            toast.error(toastNotif.text, {
                id: toastNotif.id,
                duration: toastNotif.duration
            });
        });

        window.api.handleOneWay(window.api.channels.toastLoading, (event, toastNotif: ToastFromMain) => {
            window.api.log("DEBUG", "Displaying loading toast");
            toast.loading(toastNotif.text, {
                id: toastNotif.id,
                duration: toastNotif.duration
            });
        });

        window.api.handleOneWay(window.api.channels.toastForcedType, (event, toastNotif: ToastFromMain) => {
            window.api.log("DEBUG", "Displaying forced type toast");

            if (toastNotif.type === "error")
                toast.success(toastNotif.text, {
                    id: toastNotif.id,
                    duration: toastNotif.duration
                });
            else
                toast.error(toastNotif.text, {
                    id: toastNotif.id,
                    duration: toastNotif.duration
                });
        });

        return () => {
            window.api.removeAllListeners(window.api.channels.toastSuccess);
            window.api.removeAllListeners(window.api.channels.toastError);
            window.api.removeAllListeners(window.api.channels.toastLoading);
            window.api.removeAllListeners(window.api.channels.toastForcedType);
        };
    }, []);

    return (
        <>
            <Dragbar />
            <Toaster
                position={"bottom-center"}
                toastOptions={{
                    className: styles.toastNotification,
                    success: {
                        iconTheme: {
                            primary: "rgb(33, 219, 135)",
                            secondary: "rgb(16, 18, 27)",
                        }
                    },
                    loading: {
                        iconTheme: {
                            primary: "rgb(200, 222, 245)",
                            secondary: "rgb(16, 18, 27)",
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
            <div className={styles.spacer}>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </HashRouter>
            </div>
        </>
    );
}