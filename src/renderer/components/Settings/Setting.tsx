import NumberInput from '@components/global/Inputs/NumberInput';
import Select from '@components/global/Inputs/Select';
import Switch from '@components/global/Inputs/Switch';
import TextInput from '@components/global/Inputs/TextInput';
import React from 'react';
import DisabledIndicator from './DisabledIndicator';
import IgnoredIndicator from './IgnoredIndicator';
import RestartIndicator from './RestartIndicator';

interface Props {
    setting: SettingWithValue;
    onChange: (updated: any) => void;
}

export default function Setting({ setting, onChange }: Props) {
    function actionRender() {
        if ((setting as SelectionSetting).options) {
            return (
                <Select
                    value={setting.value.toString()}
                    disabled={setting.disabled}
                    fullWidth={true}
                    options={(setting as SelectionSetting).options}
                    onChange={onChange}
                />
            );
        } else {
            if (typeof setting.value === 'boolean') {
                return (
                    <Switch
                        value={setting.value}
                        disabled={setting.disabled}
                        onChange={onChange}
                    />
                );
            } else if (typeof setting.value === 'number') {
                return (
                    <NumberInput
                        value={setting.value}
                        min={setting.min!}
                        max={setting.max!}
                        disabled={setting.disabled}
                        withButtons
                        fullWidth
                        onChange={onChange}
                    />
                );
            } else if (typeof setting.value === 'string') {
                return (
                    <TextInput
                        value={setting.value}
                        disabled={setting.disabled}
                        onChange={onChange}
                    />
                );
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
                        {setting.disabled && <DisabledIndicator />}
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
