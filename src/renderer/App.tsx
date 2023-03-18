import SignIn from '@components/Auth/SignIn';
import Dashboard from '@components/Dashboard';
import Dragbar from '@components/global/Dragbar';
import ToastNotifications from '@components/global/ToastNotifications';
import { AuthContext } from '@contexts/AuthContext';
import { FarmsContextProvider } from '@contexts/FarmsContext';
import { InternetConnectionContextProvider } from '@contexts/InternetConnectionContext';
import { ModalContextProvider } from '@contexts/ModalContext';
import { SettingsContextProvider } from '@contexts/SettingsContext';
import { UpdateContextProvider } from '@contexts/UpdateContext';
import React, { useContext } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
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
                                                    <>
                                                        {session ? (
                                                            <Navigate
                                                                to="/dashboard"
                                                                replace
                                                            />
                                                        ) : (
                                                            <Navigate
                                                                to="/signIn"
                                                                replace
                                                            />
                                                        )}
                                                    </>
                                                }
                                            />
                                            <Route
                                                path="/dashboard"
                                                element={<Dashboard />}
                                            />
                                            <Route
                                                path="/signIn"
                                                element={<SignIn />}
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
