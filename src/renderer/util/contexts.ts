import { createContext } from "react";

export const SettingsContext = createContext<Settings | undefined>(undefined);
export const InternetConnectionContext = createContext<boolean>(true);
