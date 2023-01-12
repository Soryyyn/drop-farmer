import { Icon } from '@components/global/Icon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

interface Props {
    addFarm: (farm: NewFarm) => void;
}

export default function AddFarmButton({ addFarm }: Props) {
    return (
        <div
            className="bg-pepper-900/75 rounded-lg py-4 px-8 hover:bg-pepper-900 active:bg-pepper-800 active:text-snow-300 flex flex-row items-center gap-2 justify-center leading-none font-semibold"
            onClick={() =>
                addFarm({
                    type: 'youtube',
                    id: 'lofi-girl',
                    shown: 'LoFi Girl',
                    schedule: 20,
                    url: 'https://www.youtube.com/@LofiGirl'
                })
            }
        >
            <Icon sprite={faPlus} size="lg" />
            <p>Add new farm</p>
        </div>
    );
}
