import { NewConditionType } from '@df-types/farms.types';
import {
    SelectOption,
    SettingId,
    SettingOwnerType,
    SettingType,
    SettingUnion
} from '@df-types/settings.types';

export const Toasts = {
    UpdateChecking: 'update-checking',
    FarmCreation: 'farm-creation',
    FarmDeletion: 'farm-deletion',
    FarmResetConditions: 'farm-reset-conditions',
    SettingsReset: 'settings-reset',
    SettingsSaving: 'settings-saving',
    InternetConnection: 'internet-connection',
    SignIn: 'sign-in',
    SignOut: 'sign-out'
} as const;
export type Toast = (typeof Toasts)[keyof typeof Toasts];

export const IpcChannels = {
    openLinkInExternal: 'open-link-in-external',
    getFarms: 'get-farms',
    farmStatusChange: 'farm-status-change',
    farmWindowsVisibility: 'farm-windows-visibility',
    getSettings: 'get-settings',
    saveNewSettings: 'save-new-settings',
    getApplicationVersion: 'get-application-version',
    clearCache: 'clear-cache',
    restartScheduler: 'restart-scheduler',
    shutdown: 'shutdown',
    toast: 'toast',
    internet: 'internet',
    installUpdate: 'install-update',
    updateCheck: 'update-check',
    updateStatus: 'update-status',
    farmLogin: 'farm-login',
    addNewFarm: 'add-new-farm',
    farmsChanged: 'farms-changed',
    settingsChanged: 'settings-changed',
    deleteFarm: 'delete-farm',
    resetFarmingConditions: 'reset-farming-conditions',
    resetSettingsToDefault: 'reset-settings-to-default',
    signIn: 'sign-in',
    signOut: 'sign-out',
    getChangelog: 'get-changelog'
} as const;
export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];

export const EventChannels = {
    PCWentToSleep: 'pc-went-to-sleep',
    PCWokeUp: 'pc-woke-up',
    LoginForFarm: 'login-for-farm',
    FarmsChanged: 'farms-changed'
} as const;
export type EventChannel = (typeof EventChannels)[keyof typeof EventChannels];

export const FileNames = {
    LogFileName: '.log',
    SettingsStoreFileName: 'settings',
    StatisticsStoreFileName: 'statistics'
} as const;
export type FileName = (typeof FileNames)[keyof typeof FileNames];

export const Schedules = {
    CheckToFarm: 'check-to-farm',
    Update: 'update',
    InternetConnection: 'internet-connection'
} as const;
export type Schedule = (typeof Schedules)[keyof typeof Schedules];

export const LaunchArgs = {
    ShowMainWindow: '--showMainWindow',
    SquirrelFirstRun: '--squirrel-firstrun'
} as const;
export type LaunchArg = (typeof LaunchArgs)[keyof typeof LaunchArgs];

export const Selections = {
    FarmingLocation: [
        {
            display: 'Twitch',
            value: SettingOwnerType.FarmTwitch
        },
        {
            display: 'YouTube',
            value: SettingOwnerType.FarmYoutube
        }
    ],
    FarmConditionSelect: [
        {
            display: 'Unlimited',
            value: NewConditionType.Unlimited
        },
        {
            display: 'Weekly',
            value: NewConditionType.Weekly
        },
        {
            display: 'Monthly',
            value: NewConditionType.Monthly
        },
        {
            display: 'Time window',
            value: NewConditionType.TimeWindow
        }
    ]
} as const satisfies { [name: string]: readonly SelectOption[] };
export type Selection = (typeof Selections)[keyof typeof Selections];

export const DefinedSettings: SettingUnion[] = [
    /**
     * Settings for the application.
     */
    {
        type: SettingType.Toggle,
        id: SettingId.LaunchOnStartup,
        label: 'Launch on startup',
        desc: 'Enable or disable if Drop Farmer should be started when your PC has finished booting.',
        default: false
    },
    {
        type: SettingType.Toggle,
        id: SettingId.ShowMainWindowOnLaunch,
        label: 'Show main window on launch',
        desc: 'If the main window should be shown when Drop Farmer starts.',
        default: true
    },
    {
        type: SettingType.Toggle,
        id: SettingId.ReducedMotion,
        label: 'Prefer reduced motion',
        desc: 'Enable this setting to keep animations & transitions to the minimum.',
        default: false,
        special: {
            requiresRestart: true
        }
    },
    {
        type: SettingType.Toggle,
        id: SettingId.LowResolution,
        label: 'Low resolution streams',
        desc: 'Enable this setting to automatically set the lowest resolution possible on all streams.',
        default: true
    },

    /**
     * Settings for farms.
     */
    {
        type: SettingType.Toggle,
        id: SettingId.Enabled,
        label: 'Farm enabled',
        desc: 'Enable or disable this farm.',
        default: false
    },
    {
        type: SettingType.Number,
        id: SettingId.Schedule,
        label: 'Farming schedule',
        desc: 'The schedule (in minutes) on which Drop Farmer will check if farming is possible.',
        default: 30,
        max: 60,
        min: 1
    },
    {
        type: SettingType.Text,
        id: SettingId.URL,
        label: 'Checking URL',
        desc: 'The URL the farm will check if it can farm.'
    },
    {
        type: SettingType.Selection,
        id: SettingId.ConditionType,
        label: 'Condition type',
        desc: 'The type will control how the farm will when to farm.',
        default: Selections.FarmConditionSelect[0].value,
        options: Selections.FarmConditionSelect
    },
    {
        type: SettingType.Basic,
        id: SettingId.ConditionStarted
    },
    {
        type: SettingType.Basic,
        id: SettingId.ConditionFulfilled
    },
    {
        type: SettingType.Basic,
        id: SettingId.ConditionAmount,
        default: 0
    },
    {
        type: SettingType.Number,
        id: SettingId.ConditionAmountWanted,
        label: 'Amount wanted',
        desc: 'The amount of hours the farm needs to farm before the stopping/reset condition has been fulfilled.',
        default: 4,
        min: 1,
        max: 100
    },
    {
        type: SettingType.Number,
        id: SettingId.ConditionBuffer,
        label: 'Buffer',
        desc: 'The buffer (in minutes) controls how much longer the farm will farm as a buffer because drops may not exactly happen on the hour.',
        default: 30,
        min: 0,
        max: 60
    },
    {
        type: SettingType.Toggle,
        id: SettingId.ConditionRepeating,
        label: 'Repeat after timeframe reset',
        desc: 'If the farm should repeat the condition after the timeframe is fulfilled.',
        default: true
    },
    {
        type: SettingType.Date,
        id: SettingId.ConditionFrom,
        label: 'Starting date of condition',
        desc: "The starting date; From when on the farm can farm and try to fulfill it's condition."
    },
    {
        type: SettingType.Date,
        id: SettingId.ConditionTo,
        label: 'Ending date of condition',
        desc: "The ending date; When the farm should stop trying to fulfill it's condition."
    }
];

export const RegularExpressions = {
    YoutubeChannel:
        /http(s)?:\/\/(www|m).youtube.com\/((channel|c)\/)?(?!feed|user\/|watch\?)([a-zA-Z0-9-_.])*.*/,
    TwitchChannel: /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/
} as const;
export type RegularExpression =
    (typeof RegularExpressions)[keyof typeof RegularExpressions];
