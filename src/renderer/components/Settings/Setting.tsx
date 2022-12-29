import React from 'react';
import NumberInput from './NumberInput';
import SwitchToggle from './SwitchToggle';
import TextValue from './TextValue';

interface Props {
    setting: newSetting;
    onChange: (updated: any) => void;
}

export default function Setting({ setting, onChange }: Props) {
    function actionRender() {
        if (typeof setting.value === 'boolean') {
            return <SwitchToggle setting={setting} onChange={onChange} />;
        } else if (typeof setting.value === 'number') {
            return <NumberInput setting={setting} onChange={onChange} />;
        } else if (typeof setting.value === 'string') {
            return <TextValue setting={setting} onChange={onChange} />;
        }
    }

    return (
        <li className="w-full p-4 list-none rounded-md bg-pepper-500 flex flex-row gap-4 text-snow-300">
            <div className="!w-3/4 flex flex-col gap-2">
                <p className="font-medium">{setting.shown}</p>
                <p className="text-snow-300/50">{setting.desc}</p>
            </div>
            <div className="!w-1/4 h-14 flex justify-center items-center">
                {actionRender()}
            </div>
        </li>
    );
}
