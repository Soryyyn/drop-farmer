import {
    FarmSettings,
    FarmStatusEnum,
    NewConditionType
} from '@df-types/farms.types';
import {
    NumberSetting,
    SelectionSetting,
    SettingId,
    SettingOwnerType,
    SettingUnion,
    TextSetting,
    ToggleSetting
} from '@df-types/settings.types';
import NewFarmTemplate from '@main/farming/newtemplate';
import FarmTemplate from '@main/farming/template';
import {
    addSettingToOwner,
    createSettingsOwner,
    getOrSetSetting,
    getSettingsOfOwner
} from '@main/store/settings';
import { Schedules } from './constants';
import { log } from './logging';
import { cancelPromise, createCancellablePromiseFrom } from './promises';

/**
 * The default farm settings which get overwritten after being initialized.
 */
export const DefaultFarmSettings: FarmSettings = {
    enabled: false,
    status: FarmStatusEnum.Disabled,
    schedule: 30,
    url: '',
    conditions: { type: NewConditionType.Unlimited }
};

/**
 * Create the settings for the given farm.
 */
export function createFarmSettings(farm: NewFarmTemplate) {
    /**
     * Decide on the type of the farm based on what class it instances.
     */
    if (farm.type === SettingOwnerType.FarmYoutube) {
        createSettingsOwner(farm.name, SettingOwnerType.FarmYoutube);
    } else if (farm.type === SettingOwnerType.FarmTwitch) {
        createSettingsOwner(farm.name, SettingOwnerType.FarmTwitch);
    } else {
        log(
            'warn',
            "Can't create settings for farm which is not an allowed type"
        );
        return;
    }

    /**
     * Create the base settings.
     */
    addSettingToOwner(farm.name, SettingId.Enabled);
    addSettingToOwner(farm.name, SettingId.Schedule);
    addSettingToOwner(farm.name, SettingId.URL);
    addSettingToOwner<TextSetting>(farm.name, SettingId.URL, {
        value: farm.settings.url,
        special: {
            disabled: true
        }
    });
    addSettingToOwner(farm.name, SettingId.ConditionType);

    log('info', `Created initial settings for farm ${farm.name}`);
}

/**
 * Set the default status based on if it's enabled or the condition has
 * been fulfilled.
 */
export function getInitialStatus(farm: NewFarmTemplate) {
    if (!farm.settings.enabled) {
        return FarmStatusEnum.Disabled;
    } else if (
        farm.settings.conditions.type !== NewConditionType.Unlimited &&
        farm.settings.conditions.fulfilled
    ) {
        return FarmStatusEnum.ConditionFulfilled;
    } else {
        return FarmStatusEnum.Idle;
    }
}

/**
 * Create the schedule for checking to farm.
 * Also handle the failing of the schedule etc.
 */
export function createCheckingSchedule(farm: NewFarmTemplate) {
    farm.scheduler.add(
        Schedules.CheckToFarm,
        `*/${farm.settings.schedule} * * * *`,
        async () => {
            try {
                /**
                 * If schedule is already running, skip this check.
                 */
                if (
                    farm.settings.status === FarmStatusEnum.Checking ||
                    farm.settings.status === FarmStatusEnum.AttentionRequired
                ) {
                    return;
                }

                /**
                 * If a scheduleUUID is set, a schedule is running, so
                 * cancel it.
                 */
                if (farm.scheduleUUID) {
                    cancelPromise(farm.scheduleUUID);
                    farm.scheduleUUID = undefined;
                    log(
                        'info',
                        `${farm.name}: Cancelled running schedule check`
                    );
                }

                /**
                 * Create the promise and save the UUID and await the
                 * promise after to actually run it.
                 */
                const { uuid, promise } = createCancellablePromiseFrom(
                    new Promise(() => {})
                );
                farm.scheduleUUID = uuid;
                await promise;
            } catch (error) {
                log(
                    'error',
                    `${farm.name}: Failed running schedule check, error ${error}`
                );
            }
        }
    );
}

/**
 * Apply the wanted settings to the given farm.
 */
export function applySettingsToFarm(farm: NewFarmTemplate) {
    farm.settings.enabled = getOrSetSetting<ToggleSetting>(
        farm.name,
        SettingId.Enabled
    )!;
    farm.settings.schedule = getOrSetSetting<NumberSetting>(
        farm.name,
        SettingId.Schedule
    )!;
    farm.settings.url = getOrSetSetting<TextSetting>(farm.name, SettingId.URL)!;
    farm.settings.conditions.type = getOrSetSetting<SelectionSetting>(
        farm.name,
        SettingId.ConditionType
    )! as NewConditionType;

    if (farm.settings.conditions.type === NewConditionType.Weekly) {
        farm.settings.conditions.amount = getOrSetSetting<NumberSetting>(
            farm.name,
            SettingId.ConditionAmount
        )!;
    }
}
