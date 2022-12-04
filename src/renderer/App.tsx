import Dragbar from "@components/global/Dragbar";
import ToastNotifications from "@components/global/ToastNotifications";
import Home from "@components/Home";
import { useHandleOneWay } from "@hooks/useHandleOneWay";
import { useSendAndWait } from "@hooks/useSendAndWait";
import {
    InternetConnectionContext,
    ModalContext,
    SettingsContext
} from "@util/contexts";
import React, { useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./global.css";

export default function App() {
    /**
     * Get the settings from the main process on app start and save it in the context.
     */
    const [settingsContext, setSettingsContext] = useState<Settings>();
    useSendAndWait(window.api.channels.getSettings, null, (err, settings) => {
        if (err) {
            window.api.log("ERROR", err);
        } else {
            setSettingsContext(settings);
        }
    });

    const [internetConnectionContext, setInternetConnectContext] =
        useState<boolean>(true);
    useHandleOneWay(
        window.api.channels.internet,
        null,
        (event, internetConnection) => {
            setInternetConnectContext(internetConnection);
        }
    );

    return (
        <>
            <Dragbar />
            <ToastNotifications />
            <InternetConnectionContext.Provider
                value={internetConnectionContext}
            >
                <SettingsContext.Provider value={settingsContext}>
                    <ModalContext.Provider value={undefined}>
                        <div className="p-8 flex flex-col h-screen">
                            <HashRouter>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                </Routes>
                            </HashRouter>
                        </div>
                    </ModalContext.Provider>
                </SettingsContext.Provider>
            </InternetConnectionContext.Provider>
        </>
    );
}
