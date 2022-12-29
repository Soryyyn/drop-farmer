type FarmStatus =
    | 'farming'
    | 'idle'
    | 'checking'
    | 'disabled'
    | 'attention-required';

type BasicToast = {
    id: string;
    textOnSuccess: string;
    textOnError: string;
    duration: number;
};

type PromiseToast = {
    id: string;
    textOnLoading: string;
    textOnSuccess: string;
    textOnError: string;
    duration: number;
};

type ForcedTypeToast = {
    id: string;
    type: 'success' | 'error' | 'loading';
    text: string;
    duration: number;
};

/**
 * For renderer to know the preload types.
 */
declare const api: typeof import('../api').default;

/**
 * Store.
 */
type Setting = {
    id: string;
    shown: string;
    desc: string;
    value: string | number | boolean;
    default: string | number | boolean;
    min?: number;
    max?: number;
    disabled?: boolean;
};

type SettingsSchema = {
    settings: {
        [name: string]: Setting[];
    };
};

/**
 * Logging.
 */
type LogOrigin = 'MAIN' | 'RENDERER';
type LogLevel = 'FATAL' | 'ERROR' | 'WARN' | 'DEBUG' | 'INFO';

/**
 * Farms.
 */
type FarmRendererData = {
    id: string;
    shown: string;
    status: FarmStatus;
    schedule: number;
    amountOfWindows: number;
    windowsShown: boolean;
};
