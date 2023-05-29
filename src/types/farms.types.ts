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

/**
 * Rewrite.
 */
export enum FarmStatusEnum {
    Farming = 'farming',
    Idle = 'idle',
    Checking = 'checking',
    Disabled = 'disabled',
    AttentionRequired = 'attention-required',
    ConditionFulfilled = 'condition-fulfilled'
}

export enum NewConditionType {
    Unlimited = 'unlimited',
    Weekly = 'weekly',
    Monthly = 'monthly',
    TimeWindow = 'time-window'
}

export type NewUnlimitedCondition = {
    type: NewConditionType.Unlimited;
};

export type WeeklyCondition = {
    type: NewConditionType.Weekly;
    started: Date;
    fulfilled?: Date;
    amount: number;
    amountWanted: number;
    buffer: number;
    repeat: boolean;
};

export type MonthlyCondition = {
    type: NewConditionType.Monthly;
    started: Date;
    fulfilled?: Date;
    amount: number;
    amountWanted: number;
    buffer: number;
    repeat: boolean;
};

export type NewTimeWindowCondition = {
    type: NewConditionType.TimeWindow;
    started: Date;
    fulfilled?: Date;
    amount: number;
    amountWanted: number;
    buffer: number;
    from: Date;
    to: Date;
};

export type ConditionUnion =
    | NewUnlimitedCondition
    | WeeklyCondition
    | MonthlyCondition
    | NewTimeWindowCondition;

export type FarmSettings = {
    enabled: boolean;
    url: string;
    status: FarmStatusEnum;
    schedule: number;
    conditions: ConditionUnion;
};
