import { FileNames } from '@main/common/constants';
import { app } from 'electron';
import ElectronStore from 'electron-store';
import { join } from 'path';
import { log } from './logging';

const store = new ElectronStore<StatisticsStoreSchema>({
    name: FileNames.StatisticsStoreFileName,
    clearInvalidConfig: true,
    encryptionKey:
        process.env.NODE_ENV === 'production'
            ? process.env.STORES_ENCRYPTION_KEY
            : '',
    cwd:
        process.env.NODE_ENV === 'production'
            ? app.getPath('userData')
            : join(__dirname, '../../'),
    defaults: {
        statistics: {
            overall: {
                openedWindows: 0,
                uptime: 0
            }
        }
    },
    beforeEachMigration: (store, context) => {
        log(
            'info',
            `Migrated statistics from version ${context.fromVersion} to ${context.toVersion}`
        );
    }
});

export function getStatistics(): StatisticsOnly {
    return store.get('statistics');
}

export function getStatistic(owner: string): Statistic | undefined {
    return store.get(`statistics.${owner}`);
}

export function updateStatistic(owner: string, updated: Statistic): void {
    const before = getStatistic(owner);
    store.set(`statistics.${owner}`, updated);

    /**
     * Update the overall stat when the farms get updated, but not when they get
     * initialized and/or only the conditions have not been updated.
     */
    if (
        owner !== 'overall' &&
        updated.uptime !== 0 &&
        updated.openedWindows !== 0
    ) {
        const stat = getStatistic('overall');
        updateStatistic('overall', {
            uptime: stat!.uptime + updated.uptime,
            openedWindows: stat!.openedWindows + updated.openedWindows
        });
    }
}
