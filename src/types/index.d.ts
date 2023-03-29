/**
 * For renderer to know the preload types.
 */
declare const api: typeof import('../api').default;

/**
 * So the renderer can not svg files.
 */
declare module '*.svg' {
    import React from 'react';
    const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
    export default SVG;
}

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
 * Store.
 */
type ReadonlySetting = {
    id: string;
    default?: string | number | boolean;
};

type DisplayedSettingBase = {
    id: string;
    shown: string;
    desc: string;
    requiresRestart?: boolean;
};

type NumberSetting = DisplayedSettingBase & {
    default: number;
    min: number;
    max: number;
};

type BoolishSetting = DisplayedSettingBase & {
    default: boolean;
};

type TextSetting = DisplayedSettingBase & {
    default?: string;
};

type SelectionSetting = DisplayedSettingBase & {
    default: string;
    options: any[];
};

type Setting = {
    id: string;
    default?: string | number | boolean;
    shown?: string;
    desc?: string;
    min?: number;
    max?: number;
    options?: SelectOption<any>[];
    requiresRestart?: boolean;
};

type SettingWithValue = Setting & {
    value: SettingValue;
};

type SettingsOnly = {
    [name: string]: Setting[];
};

type SettingValueWithSpecial = {
    value: string | number | boolean;
    disabled?: boolean;
    isDate?: boolean;
};

type SettingValue = string | number | boolean | SettingValueWithSpecial;

type SettingsInFile = { [settingName: string]: SettingValue };

type SettingsOfOwners = {
    [owner: string]: SettingsInFile;
};

type NewSettingsStoreSchema = {
    settings: SettingsOfOwners;
};

type SettingsStoreSchema = {
    settings: SettingsOnly;
};

type MergedSettings = {
    [name: string]: SettingWithValue[];
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
    from?: string;
    to?: string;
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

type SelectOption<T> = {
    display: string;
    value: T;
};

/**
 * Auth.
 */
type SignInObject = {
    email: string;
    password: string;
};
