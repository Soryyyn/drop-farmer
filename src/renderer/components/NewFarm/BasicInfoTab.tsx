import NumberInput from '@components/global/Inputs/NumberInput';
import Select from '@components/global/Inputs/Select';
import TextInput from '@components/global/Inputs/TextInput';
import React, { useEffect, useState } from 'react';

export type BasicInfoObject = {
    id: string;
    url: string;
    type: 'twitch' | 'youtube';
    schedule: number;
};

interface Props {
    data: BasicInfoObject;
    onChange: (changedBasicInfo: BasicInfoObject) => void;
}

export default function BasicInfoTab({ data, onChange }: Props) {
    const [basicInfo, setBasicInfo] = useState<BasicInfoObject>(data);

    useEffect(() => {
        onChange(basicInfo);
    }, [basicInfo]);

    return (
        <div className="flex flex-col gap-4">
            <TextInput
                label="Farm name"
                value={basicInfo.id}
                onChange={(changed) =>
                    setBasicInfo({
                        ...basicInfo,
                        id: changed
                    })
                }
            />
            <TextInput
                label="URL"
                value={basicInfo.url}
                onChange={(changed) =>
                    setBasicInfo({
                        ...basicInfo,
                        url: changed
                    })
                }
            />
            <Select
                label="Farming location (stream site)"
                value={
                    api.selections.FarmingLocation.find(
                        (select) => select.value === basicInfo.type
                    )?.display ?? ''
                }
                fullWidth
                options={api.selections.FarmingLocation}
                onChange={(changed) => {
                    setBasicInfo({
                        ...basicInfo,
                        type: changed
                    });
                }}
            />
            <NumberInput
                key="schedule-input"
                label="Farming schedule (in minutes)"
                value={basicInfo.schedule}
                withButtons
                fullWidth
                min={1}
                max={60}
                onChange={(changed) => {
                    setBasicInfo({
                        ...basicInfo,
                        schedule: changed
                    });
                }}
            />
        </div>
    );
}
