import { createContext } from "react";

export const SettingsContext = createContext<Settings | undefined>(undefined);
export const InternetConnectionContext = createContext<boolean>(true);

/**
 * The modal context contains the component to display inside a modal.
 * If the context is undefined, no modal should be shown.
 */
export const ModalContext = createContext<JSX.Element | undefined>(undefined);
