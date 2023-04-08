export type FarmStatus =
    | 'farming'
    | 'idle'
    | 'checking'
    | 'disabled'
    | 'attention-required'
    | 'condition-fulfilled';

export type FarmRendererData = {
    id: string;
    status: FarmStatus;
    schedule: number;
    isProtected: boolean;
    amountOfWindows: number;
    windowsShown: boolean;
    amountLeftToFulfill?: number; // in hours
    nextConditionReset?: number; // in days
};

export type LoginForFarmObject = {
    id: string;
    needed: boolean;
};

export type FarmType = 'youtube' | 'twitch';

export type NewFarm = {
    type: FarmType;
    id: string;
    schedule: number;
    url: string;
    conditions: FarmingConditions;
};

export type BaseConditions = {
    started?: Date;
    fulfilled?: Date;
};

export type UnlimitedCondition = {
    type: 'unlimited';
};

export type PeriodCondition = {
    type: 'weekly' | 'monthly';
    amount?: number; // in milliseconds
    amountToFulfill?: number; // in hours
    buffer?: number; // in minutes
    repeating?: boolean;
};

export type TimeWindowCondition = {
    type: 'timeWindow';
    amount?: number; // in milliseconds
    amountToFulfill?: number; // in hours
    buffer?: number; // in minutes
    from?: string;
    to?: string;
};

export type FarmingConditions = BaseConditions & {
    condition: UnlimitedCondition | PeriodCondition | TimeWindowCondition;
};

export type ConditionType = 'unlimited' | 'weekly' | 'monthly' | 'timeWindow';

export type ConditionCheckReturn = 'farm' | 'conditions-fulfilled';
