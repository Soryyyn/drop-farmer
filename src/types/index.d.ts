type FarmStatus =
    | 'farming'
    | 'idle'
    | 'checking'
    | 'disabled'
    | 'attention-required'
    | 'condition-fulfilled';

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
    shown?: string;
    desc?: string;
    value: string | number | boolean;
    default?: string | number | boolean;
    options?: string[];
    min?: number;
    max?: number;
    disabled?: boolean;
    requiresRestart?: boolean;
    ignores?: {
        onValue: string | number | boolean;
        ids: string[];
    };
};

type SettingsStoreSchema = {
    settings: SettingsOnly;
};

type SettingsOnly = { [name: string]: Setting[] };

type Statistic = {
    id?: string;
    uptime: number;
    openedWindows: number;
};

type Month = {
    month: string;
    farms: Statistic[];
};

type Year = {
    year: string;
    months: Month[];
};

type StatisticsOnly = {
    overall: Statistic;
    years: Year[];
};

type StatisticsStoreSchema = {
    statistics: StatisticsOnly;
};

/**
 * Farms.
 */
type FarmRendererData = {
    id: string;
    status: FarmStatus;
    schedule: number;
    isProtected: boolean;
    amountOfWindows: number;
    windowsShown: boolean;
    amountLeftToFulfill?: number; // in hours
    nextConditionReset?: number; // in days
};

type LoginForFarmObject = {
    id: string;
    needed: boolean;
};

type FarmType = 'youtube' | 'twitch';

type NewFarm = {
    type: FarmType;
    id: string;
    schedule: number;
    url: string;
    conditions: {
        timeframe: Timeframe;
        amountToFulfill?: number;
        buffer?: number;
        repeating?: boolean;
    };
};

type Timeframe = 'weekly' | 'monthly' | 'unlimited' | 'from ... to ...';

type FarmingConditions = {
    started?: Date;
    fulfilled?: Date;
    amount?: number; // in milliseconds
    amountToFulfill?: number; // in hours
    buffer?: number; // in minutes
    timeframe: Timeframe;
    from?: Date;
    to?: Date;
    repeating?: boolean; // not needed if unlimited
};

type ConditionCheckReturn = 'farm' | 'conditions-fulfilled';

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
