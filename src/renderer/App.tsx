import Dragbar from '@renderer/components/global/Dragbar';
import ToastNotifications from '@renderer/components/global/ToastNotifications';
import { FarmsContextProvider } from '@renderer/contexts/FarmsContext';
import { ModalContextProvider } from '@renderer/contexts/ModalContext';
import { SettingsContextProvider } from '@renderer/contexts/SettingsContext';
import { UpdateContextProvider } from '@renderer/contexts/UpdateContext';
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
