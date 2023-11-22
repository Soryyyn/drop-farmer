/**
 * Files & file names of generated files of the app.
 */
export const PredefinedFiles = {
    LogFileName: '.log',
    SettingsStoreFileName: 'settings',
    StatisticsStoreFileName: 'statistics'
} as const;

export type PredefinedFile =
    (typeof PredefinedFiles)[keyof typeof PredefinedFiles];
