import { app } from 'electron';
import { join } from 'path';

export const Toasts = {
    UpdateChecking: 'update-checking',
    FarmCreation: 'farm-creation'
} as const;
export type Toast = typeof Toasts[keyof typeof Toasts];

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
    deleteFarm: 'delete-farm'
} as const;
export type IpcChannel = typeof IpcChannels[keyof typeof IpcChannels];

export const EventChannels = {
    PCWentToSleep: 'pc-went-to-sleep',
    PCWokeUp: 'pc-woke-up',
    LoginForFarm: 'login-for-farm'
} as const;
export type EventChannel = typeof EventChannels[keyof typeof EventChannels];

export const FileNames = {
    LogFileName: '.log',
    SettingsStoreFileName: 'settings',
    StatisticsStoreFileName: 'statistics'
} as const;
export type FileName = typeof FileNames[keyof typeof FileNames];

export const Schedules = {
    CheckToFarm: 'check-to-farm',
    Update: 'update'
} as const;
export type Schedule = typeof Schedules[keyof typeof Schedules];

export const PathToStoreFiles: string =
    process.env.NODE_ENV === 'production'
        ? app.getPath('userData')
        : join(__dirname, '../../');
