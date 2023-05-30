import {
    FarmSettings,
    FarmStatusEnum,
    NewConditionType
} from '@df-types/farms.types';
import { SettingOwnerType } from '@df-types/settings.types';
import { Schedules } from '@main/util/constants';
import {
    DefaultFarmSettings,
    createCheckingSchedule,
    createFarmSettings,
    getInitialStatus
} from '@main/util/farming';
import CrontabManager from 'cron-job-manager';

export default abstract class NewFarmTemplate {
    name: string;
    type: SettingOwnerType;
    settings: FarmSettings;

    scheduleUUID: string | undefined;
    scheduler = new CrontabManager();

    /**
     * Construct the template with the default farm settings.
     */
    constructor(
        name: string,
        type: SettingOwnerType,
        settings: Partial<FarmSettings>
    ) {
        this.name = name;
        this.type = type;
        this.settings = { ...DefaultFarmSettings, ...settings };
    }

    /**
     * Initialize the farm and its settings, etc.
     */
    init() {
        createFarmSettings(this);
        this.settings.status = getInitialStatus(this);
        createCheckingSchedule(this);
    }

    /**
     * Stop the schedule, farming, etc. in it's track.
     */
    stop() {}

    /**
     * Update the state of the enable (is farm enabled or not).
     */
    updateEnable(enabled: boolean) {
        this.settings.enabled = enabled;

        /**
         * Update the status, based on it's last status.
         */
        if (enabled) {
            /**
             * Check if conditions have been fulfilled.
             */
            if (
                this.settings.conditions.type !== NewConditionType.Unlimited &&
                this.settings.conditions.fulfilled
            ) {
                this.updateStatus(FarmStatusEnum.ConditionFulfilled);
            } else {
                this.updateStatus(FarmStatusEnum.Idle);
            }

            /**
             * Start the scheduler after enabling the farm.
             */
            this.scheduler.startAll();
        } else {
            this.updateStatus(FarmStatusEnum.Disabled);
            this.scheduler.stopAll();
        }
    }

    /**
     * Update the status of the farm.
     */
    updateStatus(status: FarmStatusEnum) {
        this.settings.status = status;
    }

    /**
     * Update the schedule.
     */
    updateSchedule(schedule: number) {
        this.settings.schedule = schedule;

        /**
         * Update the scheduler to also update it's cron job.
         */
        if (this.scheduler.exists(Schedules.CheckToFarm)) {
            this.scheduler.update(
                Schedules.CheckToFarm,
                `*/${schedule} * * * *`
            );
        }
    }
}
