import { SettingUnion } from '@df-types/settings.types';
import FarmTemplate from '@main/farming/template';
import { createSettingsOwner } from '@main/store/settings';

/**
 * Create the settings for the given farm.
 */
export function createFarmSettings(farm: FarmTemplate) {
    createSettingsOwner(farm.id);
}

/**
 * Apply the wanted settings to the given farm.
 */
export function applySettingsToFarm(
    farm: FarmTemplate,
    settings: SettingUnion[]
) {}
