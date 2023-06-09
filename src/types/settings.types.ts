import { Selection } from '@main/util/constants';

export type SelectOption = {
    display: string;
    value: string;
};

export enum SettingType {
    Basic = 'basic',
    Number = 'number',
    Selection = 'selection',
    Text = 'text',
    Date = 'date',
    Toggle = 'toggle'
}

export enum SettingId {
    LaunchOnStartup = 'application-launchOnStartup',
    ShowMainWindowOnLaunch = 'application-showMainWindowOnLaunch',
    ReducedMotion = 'application-reducedMotion',
    LowResolution = 'application-automaticLowResolution',
    Enabled = 'farm-enabled',
    Schedule = 'farm-schedule',
    URL = 'farm-url',
    ConditionType = 'farm-condition-type',
    ConditionStarted = 'farm-condition-started',
    ConditionFulfilled = 'farm-condition-fulfilled',
    ConditionAmount = 'farm-condition-amount',
    ConditionAmountWanted = 'farm-condition-amountToFulfill',
    ConditionBuffer = 'farm-condition-buffer',
    ConditionRepeating = 'farm-condition-repeating',
    ConditionFrom = 'farm-condition-from',
    ConditionTo = 'farm-condition-to'
}

export type SpecialSettingAttributes = {
    requiresRestart?: boolean;
    disabled?: boolean;
    deprecated?: boolean;
};

export type BasicSetting = {
    type: SettingType.Basic;
    id: SettingId;
    value?: string | number | boolean;
    default?: string | number | boolean;
};

export type ToggleSetting = {
    type: SettingType.Toggle;
    id: SettingId;
    label: string;
    desc: string;
    value?: boolean;
    default: boolean;
    special?: SpecialSettingAttributes;
};

export type NumberSetting = {
    type: SettingType.Number;
    id: SettingId;
    label: string;
    desc: string;
    value?: number;
    default: number;
    min?: number;
    max?: number;
    special?: SpecialSettingAttributes;
};

export type SelectionSetting = {
    type: SettingType.Selection;
    id: SettingId;
    label: string;
    desc: string;
    value?: Selection[number]['value'];
    default: Selection[number]['value'];
    options: Selection;
    special?: SpecialSettingAttributes;
};

export type TextSetting = {
    type: SettingType.Text;
    id: SettingId;
    label: string;
    desc: string;
    value?: string;
    default?: string;
    special?: SpecialSettingAttributes;
};

export type DateSetting = {
    type: SettingType.Date;
    id: SettingId;
    label: string;
    desc: string;
    value?: string;
    special?: SpecialSettingAttributes;
};

export type SettingUnion =
    | BasicSetting
    | NumberSetting
    | SelectionSetting
    | TextSetting
    | DateSetting
    | ToggleSetting;

export type ValueOfSetting<T extends SettingUnion> = T['value'];

export enum SettingOwnerType {
    Application = 'APPLICATION',
    FarmTwitch = 'FARM_TWITCH',
    FarmYoutube = 'FARM_YOUTUBE'
}

export type SettingSchema = {
    type: SettingOwnerType;
    name: string;
    settings: SettingUnion[];
};

export type SettingsObject = {
    [owner: string]: SettingSchema;
};

/**
 * The schema of the settings.
 *
 * Inside the settings object, each key resembles an 'owner' of the settings
 * listed in its array of settings.
 * Predefined is only the application owner.
 */
export type SettingStoreSchema = {
    settings: SettingsObject;
};
