import { useHandleOneWay } from "@hooks/useHandleOneWay";
import { useSendAndWait } from "@hooks/useSendAndWait";
import { cloneDeep, isEqual } from "lodash";
import React, { createContext, useState } from "react";
import Settings from "../modals/Settings/Settings";
import { Modals } from "./modals";

/**
 * Contexts
 */
export const SettingsContext = createContext<
    | {
          settings: Settings | undefined;
          setNewSettings: (newSettings: Settings) => void;
      }
    | undefined
>(undefined);
export const InternetConnectionContext = createContext<boolean>(true);
export const ModalContext = createContext<
    | {
          currentModal: Modals | undefined;
          setCurrentModal: (modal: Modals | undefined) => void;
      }
    | undefined
>(undefined);

interface Props {
    children: JSX.Element | JSX.Element[];
}

/**
 * Provider components
 */
export function SettingsContextProvider({ children }: Props) {
    const [settings, setSettings] = useState<Settings>();
    const [oldSettings, setOldSettings] = useState<Settings>();

    useSendAndWait(window.api.channels.getSettings, null, (err, settings) => {
        if (err) {
            window.api.log("ERROR", err);
        } else {
            setSettings(settings);
            setOldSettings(settings);
        }
    });

    /**
     * Function to save new settings in the main process.
     * Only if new changes actually happened.
     */
    function setNewSettings(newSettings: Settings) {
        if (!isEqual(newSettings, oldSettings)) {
            window.api.sendOneWay(
                window.api.channels.saveNewSettings,
                newSettings
            );

            setOldSettings(cloneDeep(newSettings));
        }
    }

    return (
        <SettingsContext.Provider value={{ settings, setNewSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function InternetConnectionContextProvider({ children }: Props) {
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
        <InternetConnectionContext.Provider value={internetConnectionContext}>
            {children}
        </InternetConnectionContext.Provider>
    );
}

export function ModalContextProvider({ children }: Props) {
    const [currentModal, setCurrentModal] = useState<Modals | undefined>(
        undefined
    );

    return (
        <ModalContext.Provider value={{ currentModal, setCurrentModal }}>
            {children}
        </ModalContext.Provider>
    );
}
