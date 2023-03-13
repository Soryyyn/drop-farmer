import Dashboard from '@components/Dashboard';
import Dragbar from '@components/global/Dragbar';
import ToastNotifications from '@components/global/ToastNotifications';
import {
    FarmsContextProvider,
    InternetConnectionContextProvider,
    ModalContextProvider,
    SettingsContextProvider,
    UpdateContextProvider
} from '@renderer/util/contexts';
import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './global.css';

export default function App() {
    return (
        <>
            <Dragbar />
            <ToastNotifications />
            <InternetConnectionContextProvider>
                <UpdateContextProvider>
                    <SettingsContextProvider>
                        <FarmsContextProvider>
                            <ModalContextProvider>
                                <div className="p-8 flex flex-col h-screen">
                                    <HashRouter>
                                        <Routes>
                                            <Route
                                                path="/"
                                                element={<Dashboard />}
                                            />
                                        </Routes>
                                    </HashRouter>
                                </div>
                            </ModalContextProvider>
                        </FarmsContextProvider>
                    </SettingsContextProvider>
                </UpdateContextProvider>
            </InternetConnectionContextProvider>
        </>
    );
}
