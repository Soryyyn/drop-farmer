export const Toasts = {
    UpdateChecking: 'update-checking',
    FarmCreation: 'farm-creation',
    FarmDeletion: 'farm-deletion',
    FarmResetConditions: 'farm-reset-conditions',
    SettingsReset: 'settings-reset',
    SettingsSaving: 'settings-saving',
    InternetConnection: 'internet-connection'
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
    resetSettingsToDefault: 'reset-settings-to-default'
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

/**
 * Selections.
 */
export const Selections = {
    FarmingLocation: [
        {
            display: 'YouTube',
            value: 'youtube'
        },
        {
            display: 'Twitch',
            value: 'twitch'
        }
    ],
    FarmConditionSelect: [
        {
            display: 'Unlimited',
            value: 'unlimited'
        },
        {
            display: 'Weekly',
            value: 'weekly'
        },
        {
            display: 'Monthly',
            value: 'monthly'
        },
        {
            display: 'From ... to ...',
            value: 'timeWindow'
        }
    ]
};

/**
 * Possible settings to appear in the settings file.
 */
export const PossibleSettings: Setting[] = [
    /**
     * Application settings
     */
    {
        id: 'application-launchOnStartup',
        shown: 'Launch on startup',
        desc: 'Enable or disable if Drop Farmer should be started when your PC has finished booting.',
        default: false
    },
    {
        id: 'application-showMainWindowOnLaunch',
        shown: 'Show main window on launch',
        desc: 'If the main window should be shown when Drop Farmer starts.',
        default: true
    },
    {
        id: 'application-showWindowsForLogin',
        shown: 'Show farm windows automatically for login',
        desc: 'If enabled, the window of a farm, where login is required to continue, will automatically be shown.',
        default: false
    },
    {
        id: 'application-reducedMotion',
        shown: 'Prefer reduced motion',
        desc: 'Enable this setting to keep animations & transitions to the minimum.',
        default: false,
        requiresRestart: true
    },

    /**
     * Farm settings.
     */
    {
        id: 'farm-enabled',
        shown: 'Farm enabled',
        desc: 'Enable or disable this farm.',
        default: false
    },
    {
        id: 'farm-schedule',
        shown: 'Farming schedule',
        desc: 'The schedule (in minutes) on which Drop Farmer will check if farming is possible.',
        default: 30,
        max: 60,
        min: 1
    },
    {
        id: 'farm-url',
        shown: 'Checking URL',
        desc: 'The URL the farm will check if it can farm.'
    },

    /**
     * Farm condition settings.
     */
    {
        id: 'farm-condition-type',
        shown: 'Condition type',
        desc: 'The type will control how the farm will when to farm.',
        default: 'unlimited',
        options: Selections.FarmConditionSelect
    },
    {
        id: 'farm-condition-started',
        default: ''
    },
    {
        id: 'farm-condition-fulfilled',
        default: ''
    },
    {
        id: 'farm-condition-amount',
        default: 0
    },
    {
        id: 'farm-condition-amountToFulfill',
        shown: 'Amount to fulfill condition',
        desc: 'The amount of hours the farm needs to farm before the stopping/reset condition has been fulfilled.',
        default: 4,
        min: 1,
        max: 100
    },
    {
        id: 'farm-condition-buffer',
        shown: 'Buffer',
        desc: 'The buffer (in minutes) controls how much longer the farm will farm as a buffer because drops may not exactly happen on the hour.',
        default: 30,
        min: 0,
        max: 60
    },
    {
        id: 'farm-condition-repeating',
        shown: 'Repeat after timeframe reset',
        desc: 'If the farm should repeat the condition after the timeframe is fulfilled.',
        default: true
    },
    {
        id: 'farm-condition-from',
        shown: 'Starting date of condition',
        desc: "The starting date; From when on the farm can farm and try to fulfill it's condition.",
        default: ''
    },
    {
        id: 'farm-condition-to',
        shown: 'Ending date of condition',
        desc: "The ending date; When the farm should stop trying to fulfill it's condition.",
        default: ''
    }
];

/**
 * Regular expressions.
 */
export const RegularExpressions = {
    YoutubeChannel:
        /http(s)?:\/\/(www|m).youtube.com\/((channel|c)\/)?(?!feed|user\/|watch\?)([a-zA-Z0-9-_.])*.*/,
    TwitchChannel: /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/
};
