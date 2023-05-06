import {
    SelectionSetting,
    SettingValueWithSpecial,
    SettingWithValue
} from '@df-types/settings.types';
import DateInput from '@renderer/components/global/Inputs/DateInput';
import NumberInput from '@renderer/components/global/Inputs/NumberInput';
import Select from '@renderer/components/global/Inputs/Select';
import Switch from '@renderer/components/global/Inputs/Switch';
import TextInput from '@renderer/components/global/Inputs/TextInput';
import React from 'react';
import DisabledIndicator from './DisabledIndicator';
import RestartIndicator from './RestartIndicator';

interface Props {
    setting: SettingWithValue;
    onChange: (updated: any) => void;
}

export default function Setting({ setting, onChange }: Props) {
    function actionRender() {
        if ('options' in setting) {
            return (
                <Select
                    value={
                        setting.options!.find(
                            (option) => option.value === setting.value
                        )!
                    }
                    disabled={
                        (setting.value as SettingValueWithSpecial).disabled ??
                        false
                    }
                    fullWidth={true}
                    options={(setting as SelectionSetting).options}
                    onChange={onChange}
                />
            );
        } else {
            if (
                typeof setting.value === 'boolean' ||
                typeof (setting.value as SettingValueWithSpecial).value ===
                    'boolean'
            ) {
                return (
                    <Switch
                        value={
                            ((setting.value as SettingValueWithSpecial)
                                .value as boolean) ?? setting.value
                        }
                        disabled={
                            (setting.value as SettingValueWithSpecial)
                                .disabled ?? false
                        }
                        onChange={onChange}
                    />
                );
            } else if (
                typeof setting.value === 'number' ||
                typeof (setting.value as SettingValueWithSpecial).value ===
                    'number'
            ) {
                return (
                    <NumberInput
                        key={`${setting.id}-number-input`}
                        value={
                            ((setting.value as SettingValueWithSpecial)
                                .value as number) ?? setting.value
                        }
                        min={setting.min!}
                        max={setting.max!}
                        disabled={
                            (setting.value as SettingValueWithSpecial)
                                .disabled ?? false
                        }
                        withButtons
                        fullWidth
                        onChange={onChange}
                    />
                );
            } else if (
                typeof setting.value === 'string' ||
                typeof (setting.value as SettingValueWithSpecial).value ===
                    'string'
            ) {
                if ((setting.value as SettingValueWithSpecial).isDate) {
                    return (
                        <DateInput
                            value={
                                (setting.value as SettingValueWithSpecial)
                                    .value as string
                            }
                            disabled={
                                (setting.value as SettingValueWithSpecial)
                                    .disabled ?? false
                            }
                            onChange={onChange}
                        />
                    );
                } else {
                    return (
                        <TextInput
                            value={
                                ((setting.value as SettingValueWithSpecial)
                                    .value as string) ?? setting.value
                            }
                            disabled={
                                (setting.value as SettingValueWithSpecial)
                                    .disabled ?? false
                            }
                            onChange={onChange}
                        />
                    );
                }
            }
        }
    }

    return (
        <li
            className="w-full p-4 list-none rounded-md bg-pepper-500 flex flex-row gap-4 text-snow-300"
            key={setting.id}
        >
            <div className="w-3/4 min-w-[550px] max-w-3/4 flex flex-col gap-2">
                <div className="flex flex-row gap-4">
                    <p className="font-medium">{setting.shown}</p>
                    <div className="flex flex-row gap-2 grow">
                        {(setting.value as SettingValueWithSpecial)
                            .disabled && <DisabledIndicator />}
                        {setting.requiresRestart && <RestartIndicator />}
                    </div>
                </div>
                <p className="text-snow-300/50">{setting.desc}</p>
            </div>
            <div className="w-1/4 min-w-1/4 max-w-1/4 h-14 flex justify-center items-center">
                {actionRender()}
            </div>
        </li>
    );
}
