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
type ReadonlySetting = {
    id: string;
    value: string | number | boolean;
    default?: string | number | boolean;
};

type DisplayedSettingBase = {
    id: string;
    shown: string;
    desc: string;
    disabled: boolean;
    requiresRestart?: boolean;
    ignores?: {
        onValue: string | number | boolean;
        ids: string[];
    }[];
};

type NumberSetting = DisplayedSettingBase & {
    value: number;
    default: number;
    min: number;
    max: number;
};

type BoolishSetting = DisplayedSettingBase & {
    value: boolean;
    default: boolean;
};

type TextSetting = DisplayedSettingBase & {
    value: string;
    default: string;
};

type SelectionSetting = DisplayedSettingBase & {
    value: string;
    default: string;
    options: {
        display: string;
        value: string;
    }[];
};

type Setting =
    | NumberSetting
    | BoolishSetting
    | TextSetting
    | SelectionSetting
    | ReadonlySetting;

type SettingsOnly = {
    [name: string]: Setting[];
};

type SettingsStoreSchema = {
    settings: SettingsOnly;
};

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
    conditions: FarmingConditions;
};

type BaseConditions = {
    started?: Date;
    fulfilled?: Date;
};

type UnlimitedCondition = {
    type: 'unlimited';
};

type PeriodCondition = {
    type: 'weekly' | 'monthly';
    amount?: number; // in milliseconds
    amountToFulfill?: number; // in hours
    buffer?: number; // in minutes
    repeating?: boolean;
};

type TimeWindowCondition = {
    type: 'timeWindow';
    amount?: number; // in milliseconds
    amountToFulfill?: number; // in hours
    buffer?: number; // in minutes
    from?: Date | string;
    to?: Date | string;
};

type FarmingConditions = BaseConditions & {
    condition: UnlimitedCondition | PeriodCondition | TimeWindowCondition;
};

type ConditionType = 'unlimited' | 'weekly' | 'monthly' | 'timeWindow';

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
