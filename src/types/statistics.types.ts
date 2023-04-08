export type Statistic = {
    id?: string;
    uptime: number;
    openedWindows: number;
};

export type Month = {
    month: string;
    farms: Statistic[];
};

export type Year = {
    year: string;
    months: Month[];
};

export type StatisticsOnly = {
    overall: Statistic;
    years: Year[];
};

export type StatisticsStoreSchema = {
    statistics: StatisticsOnly;
};
