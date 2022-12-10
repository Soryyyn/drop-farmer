import Dragbar from "@components/global/Dragbar";
import ToastNotifications from "@components/global/ToastNotifications";
import Home from "@components/Home";
import {
    InternetConnectionContextProvider,
    ModalContextProvider,
    SettingsContextProvider
} from "@util/contexts";
import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./global.css";

export default function App() {
    return (
        <>
            <Dragbar />
            <ToastNotifications />
            <InternetConnectionContextProvider>
                <SettingsContextProvider>
                    <ModalContextProvider>
                        <div className="p-8 flex flex-col h-screen">
                            <HashRouter>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                </Routes>
                            </HashRouter>
                        </div>
                    </ModalContextProvider>
                </SettingsContextProvider>
            </InternetConnectionContextProvider>
        </>
    );
}
