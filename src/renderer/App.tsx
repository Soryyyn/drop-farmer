import Dragbar from '@components/global/Dragbar';
import ToastNotifications from '@components/global/ToastNotifications';
import { AuthContext } from '@contexts/AuthContext';
import { FarmsContextProvider } from '@contexts/FarmsContext';
import { InternetConnectionContextProvider } from '@contexts/InternetConnectionContext';
import { ModalContextProvider } from '@contexts/ModalContext';
import { SettingsContextProvider } from '@contexts/SettingsContext';
import { UpdateContextProvider } from '@contexts/UpdateContext';
import React, { useContext } from 'react';
import './global.css';
import Router from './Router';

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
                                    <Router />
                                </div>
                            </ModalContextProvider>
                        </FarmsContextProvider>
                    </SettingsContextProvider>
                </UpdateContextProvider>
            </InternetConnectionContextProvider>
        </>
    );
}
