import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HashRouter, Route, Routes } from "react-router-dom";
import Dragbar from "./components/Dragbar";
import Home from "./sites/Home";

export default function App() {
    /**
     * React to toast signals coming from main.
     */
    useEffect(() => {
        window.api.handleOneWay(window.api.channels.toastSuccess, (event, toastNotif: ToastFromMain) => {
            toast.success(toastNotif.text, {
                id: toastNotif.id,
                duration: toastNotif.duration
            });
        });

        window.api.handleOneWay(window.api.channels.toastError, (event, toastNotif: ToastFromMain) => {
            toast.error(toastNotif.text, {
                id: toastNotif.id,
                duration: toastNotif.duration
            });
        });

        window.api.handleOneWay(window.api.channels.toastLoading, (event, toastNotif: ToastFromMain) => {
            toast.loading(toastNotif.text, {
                id: toastNotif.id,
                duration: toastNotif.duration
            });
        });

        window.api.handleOneWay(window.api.channels.toastForcedType, (event, toastNotif: ToastFromMain) => {
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
                    style: {
                        minWidth: "450px",
                        background: "rgba(16, 18, 27, 0.75)",
                        border: "1px solid rgba(16, 18, 27, 0.1)",
                        boxShadow: "5px 5px 15px rgba(16, 18, 27, 0.4)",
                        backdropFilter: "blur(20px)",
                        color: "rgb(200, 222, 245)",
                        padding: "0.75rem",
                    },
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
            <div
                style={{
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh"
                }}
            >
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </HashRouter>
            </div>
        </>
    );
}