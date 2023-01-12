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

type SettingsStoreSchema = {
    settings: {
        [name: string]: Setting[];
    };
};

/**
 * Farms.
 */
type FarmRendererData = {
    id: string;
    shown: string;
    status: FarmStatus;
    schedule: number;
    isProtected: boolean;
    amountOfWindows: number;
    windowsShown: boolean;
};

type LoginForFarmObject = {
    id: string;
    shown: string;
    needed: boolean;
};

type FarmType = 'youtube' | 'twitch';

type NewFarm = {
    type: FarmType;
    id: string;
    shown: string;
    schedule: number;
    url: string;
};

/**
 * Toasts.
 */
type ToastType = 'success' | 'error' | 'loading' | 'basic' | 'promise';

type Toast = {
    type: ToastType;
    id: string;
    duration: number;
    textOnSuccess?: string;
    textOnError?: string;
    textOnLoading?: string;
};
