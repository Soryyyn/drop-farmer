import { FileNames } from '@main/common/constants';
import { app } from 'electron';
import ElectronStore from 'electron-store';
import { join } from 'path';
import { getCurrentDate, getCurrentMonthName } from './calendar';
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
            },
            years: []
        }
    },
    beforeEachMigration: (store, context) => {
        log(
            'info',
            `Migrated statistics from version ${context.fromVersion} to ${context.toVersion}`
        );
    },
    migrations: {
        '<v1.0.0-beta37': (store) => {
            store.clear();
        }
    }
});

export function getStatistics(): StatisticsOnly {
    return store.get('statistics');
}

export function getStatistic(owner: string): Statistic | undefined {
    return store.get(`statistics.${owner}`);
}

export function updateStatistic(
    owner: string,
    updated: Statistic
): Promise<void> {
    return new Promise((resolve) => {
        const statsBeforeUpdate = getStatistic(owner);
        store.set(`statistics.${owner}`, updated);

        /**
         * Update the overall stat when the farms get updated, but not when they get
         * initialized and/or only the conditions have not been updated.
         */
        if (owner !== 'overall' && statsBeforeUpdate) {
            const stat = getStatistic('overall');

            store.set('statistics.overall', {
                uptime:
                    stat!.uptime + (updated.uptime - statsBeforeUpdate!.uptime),
                openedWindows:
                    stat!.openedWindows +
                    (updated.openedWindows - statsBeforeUpdate!.openedWindows)
            });
        }

        resolve(undefined);
    });
}

/**
 * Add the current year to the statistics.
 */
function addCurrentYear(): void {
    const years = getStatistics().years;

    /**
     * Check if the a entry with the current year is found.
     */
    const found = years.find(
        (yearEntry) =>
            yearEntry.year === getCurrentDate().getFullYear().toString()
    );

    if (!found) {
        years.push({
            year: getCurrentDate().getFullYear().toString(),
            months: []
        });

        store.set('statistics.years', years);
    }
}

function addCurrentMonthToYear(): void {
    const years = getStatistics().years;

    const currentYear = years.find(
        (yearEntry) =>
            yearEntry.year === getCurrentDate().getFullYear().toString()
    );
    const indexToReplace = years.indexOf(currentYear!);

    const found = currentYear!.months.find(
        (monthEntry) => monthEntry.month === getCurrentMonthName()
    );

    if (!found) {
        currentYear!.months.push({
            month: getCurrentMonthName(),
            farms: []
        });

        years[indexToReplace] = currentYear!;

        store.set('statistics.years', years);
    }
}

/**
 * App start things.
 */
addCurrentYear();
addCurrentMonthToYear();
