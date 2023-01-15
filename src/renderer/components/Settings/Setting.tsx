import React from 'react';
import DisabledIndicator from './DisabledIndicator';
import NumberInput from './NumberInput';
import RestartIndicator from './RestartIndicator';
import SelectionInput from './SelectionInput';
import SwitchToggle from './SwitchToggle';
import TextValue from './TextValue';

interface Props {
    setting: Setting;
    onChange: (updated: any) => void;
}

export default function Setting({ setting, onChange }: Props) {
    function actionRender() {
        if (setting.options) {
            return <SelectionInput setting={setting} onChange={onChange} />;
        } else {
            if (typeof setting.value === 'boolean') {
                return <SwitchToggle setting={setting} onChange={onChange} />;
            } else if (typeof setting.value === 'number') {
                return <NumberInput setting={setting} onChange={onChange} />;
            } else if (typeof setting.value === 'string') {
                return <TextValue setting={setting} onChange={onChange} />;
            }
        }
    }

    return (
        <li className="w-full p-4 list-none rounded-md bg-pepper-500 flex flex-row gap-4 text-snow-300">
            <div className="!w-3/4 flex flex-col gap-2">
                <div className="flex flex-row gap-4">
                    <p className="font-medium">{setting.shown}</p>
                    {setting.disabled && <DisabledIndicator />}
                    {setting.requiresRestart && <RestartIndicator />}
                </div>
                <p className="text-snow-300/50">{setting.desc}</p>
            </div>
            <div className="!w-1/4 h-14 flex justify-center items-center">
                {actionRender()}
            </div>
        </li>
    );
}
