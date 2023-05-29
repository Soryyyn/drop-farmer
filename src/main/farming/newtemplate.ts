import { FarmSettings } from '@df-types/farms.types';
import { SettingOwnerType } from '@df-types/settings.types';
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
}
