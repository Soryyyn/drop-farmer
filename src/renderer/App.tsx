import Auth from '@components/Auth';
import Dashboard from '@components/Dashboard';
import Dragbar from '@components/global/Dragbar';
import ToastNotifications from '@components/global/ToastNotifications';
import {
    AuthContext,
    FarmsContextProvider,
    InternetConnectionContextProvider,
    ModalContextProvider,
    SettingsContextProvider,
    UpdateContextProvider
} from '@renderer/util/contexts';
import React, { useContext } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './global.css';

export default function App() {
    const { session } = useContext(AuthContext);

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
                                                element={
                                                    // !session ? (
                                                    //     <Auth />
                                                    // ) : (
                                                    <Dashboard />
                                                    // )
                                                }
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
