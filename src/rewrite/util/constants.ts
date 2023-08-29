export const FileNames = {
    LogFileName: '.log',
    SettingsStoreFileName: 'settings',
    StatisticsStoreFileName: 'statistics'
} as const;
export type FileName = (typeof FileNames)[keyof typeof FileNames];
