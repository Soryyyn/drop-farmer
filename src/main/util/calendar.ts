import FarmTemplate from '@main/farming/template';
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
export function formattedStringToDate(date: string): Date {
    const params = date.split('-');
    return dayjs()
        .set('year', parseInt(params[2]))
        .set('month', parseInt(params[1]) - 1)
        .set('date', parseInt(params[0]))
        .toDate();
}

/**
 * Parse a ISO string to a date.
 */
export function ISOStringToDate(string: string): Date {
    return dayjs(string).toDate();
}

/**
 * Parse a date to an ISO string.
 */
export function dateToISOString(date: Date): string {
    return dayjs(date).toISOString();
}

/**
 * Parse a string to a date.
 */
export function getDate(string: string): Date | undefined {
    if (string !== '') return dayjs(string).toDate();
}

/**
 * Check if a date is between two other dates.
 */
export function isDateBetweenDates(
    dateToCheck: Date,
    first: Date,
    second: Date
): boolean {
    return dateToCheck >= first && dateToCheck <= second;
}

/**
 * Convert a time (99:99) to milliseconds.
 */
export function minutesAndSecondsToMS(time: string): number {
    const times = time.split(':');
    return dayjs
        .duration({
            minutes: parseInt(times[0]),
            seconds: parseInt(times[1])
        })
        .asMilliseconds();
}

/**
 * Get the time left to fulfill for a specific farm.
 */
export function getTimeLeftToFulfill(farm: FarmTemplate): number {
    switch (farm.conditions.condition.type) {
        case 'unlimited':
            return 0;
        default:
            return msInHours(
                combineTimeUnits({
                    hours: farm.conditions.condition.amountToFulfill,
                    minutes: farm.conditions.condition.buffer
                }).asMilliseconds() - farm.conditions.condition.amount!,
                true
            );
    }
}

/**
 * Get the next condition reset.
 */
export function getNextConditionReset(farm: FarmTemplate): number {
    switch (farm.conditions.condition.type) {
        case 'monthly':
            return remainingDaysInMonth();
        case 'weekly':
            return remainingDaysInWeek();
        case 'timeWindow':
            return Infinity;
        default:
            return Infinity;
    }
}
