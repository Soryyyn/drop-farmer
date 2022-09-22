import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HashRouter, Route, Routes } from "react-router-dom";
import Dragbar from "./components/Dragbar";
import Home from "./sites/Home";
import Settings from "./sites/Settings";
import styles from "./styles/App.module.scss";

export default function App() {
    /**
     * React to toast signals.
     */
    useEffect(() => {
        window.api.handleOneWay(window.api.channels.toast, (event, toastNotification) => {
            window.api.log("DEBUG", "Displaying toast");

            if (toastNotification.type === "error")
                toast.error(toastNotification.body, {
                    id: toastNotification.id,
                    duration: toastNotification.duration
                });
            else if (toastNotification.type === "success")
                toast.success(toastNotification.body, {
                    id: toastNotification.id,
                    duration: toastNotification.duration
                });
        });

        return () => {
            window.api.removeAllListeners(window.api.channels.toast);
        };
    }, []);

    return (
        <>
            <Dragbar />
            <Toaster
                position={"bottom-center"}
                toastOptions={{
                    className: styles.toastNotification,
                }}
            />
            <div className={styles.spacer}>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </HashRouter>
            </div>
        </>
    );
}