import Dragbar from '@components/global/Dragbar';
import ToastNotifications from '@components/global/ToastNotifications';
import { FarmsContextProvider } from '@contexts/FarmsContext';
import { ModalContextProvider } from '@contexts/ModalContext';
import { SettingsContextProvider } from '@contexts/SettingsContext';
import { UpdateContextProvider } from '@contexts/UpdateContext';
import React from 'react';
import Router from './Router';
import './global.css';

export default function App() {
    return (
        <>
            <Dragbar />
            <ToastNotifications />
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
        </>
    );
}
