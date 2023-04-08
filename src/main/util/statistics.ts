import {
    Statistic,
    StatisticsOnly,
    StatisticsStoreSchema
} from '@df-types/statistics.types';
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
        '<=v1.0.0-beta37': (store) => {
            store.clear();
        }
    }
});

export function getStatistics(): StatisticsOnly {
    return store.get('statistics');
}

/**
 * Update a farm statistic in the current month of the current year, and add it
 * to the overall statistic too.
 */
export function updateFarmStatistic(
    farmId: string,
    toAdd: Statistic
): Promise<void> {
    return new Promise((resolve) => {
        const statistics = getStatistics();
        const currentYear = statistics.years.find(
            (year) => year.year === getCurrentDate().getFullYear().toString()
        );
        const indexOfYear = statistics.years.indexOf(currentYear!);
        const currentMonth = currentYear?.months.find(
            (month) => month.month === getCurrentMonthName()
        );
        const indexOfMonth = currentYear?.months.indexOf(currentMonth!);

        /**
         * Check if the farm exists in the current month of the current year. If not
         * add it.
         */
        const indexToUpdate = currentMonth?.farms.findIndex(
            (farmStat) => farmStat.id === farmId
        );

        /**
         * Push the farm to the farms if it cant be found.
         */
        if (indexToUpdate === -1) {
            currentMonth!.farms.push(toAdd);
        } else {
            currentMonth!.farms[indexToUpdate!].uptime =
                currentMonth!.farms[indexToUpdate!].uptime + toAdd.uptime;
            currentMonth!.farms[indexToUpdate!].openedWindows =
                currentMonth!.farms[indexToUpdate!].openedWindows +
                toAdd.openedWindows;
        }

        /**
         * Update the updated month in the year.
         */
        currentYear!.months[indexOfMonth!] = currentMonth!;
        statistics.years[indexOfYear] = currentYear!;
        store.set('statistics.years', statistics.years);

        /**
         * Also add the statistics to the overall stats.
         */
        const overall: Statistic = {
            uptime: statistics.overall.uptime + toAdd.uptime,
            openedWindows:
                statistics.overall.openedWindows + toAdd.openedWindows
        };
        store.set('statistics.overall', overall);

        resolve();
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
