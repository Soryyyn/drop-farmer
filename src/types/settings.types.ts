import { Selection } from '@main/common/constants';

export type SelectOption<T> = {
    display: string;
    value: T;
};

export type ReadonlySetting = {
    id: string;
    default?: string | number | boolean;
};

export type DisplayedSettingBase = {
    id: string;
    shown: string;
    desc: string;
    requiresRestart?: boolean;
};

export type NumberSetting = DisplayedSettingBase & {
    default: number;
    min: number;
    max: number;
};

export type BoolishSetting = DisplayedSettingBase & {
    default: boolean;
};

export type TextSetting = DisplayedSettingBase & {
    default?: string;
};

export type SelectionSetting = DisplayedSettingBase & {
    default: string;
    options: any[];
};

export type Setting = {
    id: string;
    default?: string | number | boolean;
    shown?: string;
    desc?: string;
    min?: number;
    max?: number;
    options?: SelectOption<any>[];
    requiresRestart?: boolean;
};

export type SettingWithValue = Setting & {
    value: SettingValue;
};

export type SettingsOnly = {
    [name: string]: Setting[];
};

export type SettingValueWithSpecial = {
    value: string | number | boolean;
    disabled?: boolean;
    isDate?: boolean;
};

export type SettingValue = string | number | boolean | SettingValueWithSpecial;

export type SettingsInFile = { [settingName: string]: SettingValue };

export type SettingsOfOwners = {
    [owner: string]: SettingsInFile;
};

export type SettingsStoreSchema = {
    settings: SettingsOfOwners;
};

export type MergedSettings = {
    [name: string]: SettingWithValue[];
};
