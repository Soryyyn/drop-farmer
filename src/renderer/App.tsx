import { default as SignIn } from '@components/Auth/SignIn';
import Dashboard from '@components/Dashboard';
import Dragbar from '@components/global/Dragbar';
import ToastNotifications from '@components/global/ToastNotifications';
import { AuthContextProvider } from '@contexts/AuthContext';
import { FarmsContextProvider } from '@contexts/FarmsContext';
import { InternetConnectionContextProvider } from '@contexts/InternetConnectionContext';
import { ModalContextProvider } from '@contexts/ModalContext';
import { SettingsContextProvider } from '@contexts/SettingsContext';
import { UpdateContextProvider } from '@contexts/UpdateContext';
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
                                        <AuthContextProvider>
                                            <Routes>
                                                <Route
                                                    path="/"
                                                    element={<Dashboard />}
                                                />
                                                <Route
                                                    path="/signIn"
                                                    element={<SignIn />}
                                                />
                                            </Routes>
                                        </AuthContextProvider>
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
