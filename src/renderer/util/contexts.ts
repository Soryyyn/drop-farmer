import { createContext } from "react";
import { Modals } from "./modals";

export const SettingsContext = createContext<Settings | undefined>(undefined);
export const InternetConnectionContext = createContext<boolean>(true);

/**
 * If the context value is undefined, no modal should be shown.
 */
export const ModalContext = createContext<Modals | undefined>(undefined);
