import dayjs from 'dayjs';
import CustomParseFormatPlugin from 'dayjs/plugin/customParseFormat';
import DurationPlugin, { Duration } from 'dayjs/plugin/duration';

dayjs.extend(DurationPlugin);
dayjs.extend(CustomParseFormatPlugin);

/**
 * Get the remaining days in the current week.
 */
export function remainingDaysInWeek(): number {
    return 7 - dayjs().day();
}

/**
 * Get the remaining days in the month.
 */
export function remainingDaysInMonth(): number {
    return dayjs().daysInMonth() - dayjs().date();
}

/**
 * Get an amount of milliseconds as minutes.
 */
export function msInMinutes(ms: number): number {
    return dayjs.duration({ milliseconds: ms }).asMinutes();
}

/**
 * Get an amount of milliseconds as hours.
 */
export function msInHours(ms: number, rounded?: boolean): number {
    const hours = dayjs.duration({ milliseconds: ms }).asHours();

    if (rounded) {
        return Math.round(hours);
    }

    return hours;
}

/**
 * Gets the current date.
 */
export function getCurrentDate(): Date {
    return dayjs().toDate();
}

/**
 * Combine different time units.
 */
export function combineTimeUnits(
    units: Partial<{
        milliseconds: number;
        seconds: number;
        minutes: number;
        hours: number;
        days: number;
        weeks: number;
        months: number;
        years: number;
    }>
): Duration {
    return dayjs.duration(units);
}

/**
 * Gets the current month name. Ex. 'January' or 'February'.
 */
export function getCurrentMonthName(): string {
    return dayjs(getCurrentDate()).format('MMMM');
}

/**
 * Parse the wanted string of the needed format to a date.
 */
export function stringToDate(string: string): Date {
    return dayjs(string, 'DD-MM-YYYY').toDate();
}
