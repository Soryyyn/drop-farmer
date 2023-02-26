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
                label="Farming location (Stream site)"
                value={basicInfo.type}
                fullWidth
                options={[
                    {
                        display: 'Twitch',
                        value: 'twitch'
                    },
                    {
                        display: 'YouTube',
                        value: 'youtube'
                    }
                ]}
                onChange={(changed) => {
                    setBasicInfo({
                        ...basicInfo,
                        type: changed
                    });
                }}
            />
            <NumberInput
                label="Farming schedule"
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
