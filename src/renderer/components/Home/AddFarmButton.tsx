import { Icon } from '@components/global/Icon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

export default function AddFarmButton() {
    return (
        <div className="bg-pepper-900/75 rounded-lg py-4 px-8 hover:bg-pepper-900 active:bg-pepper-800 active:text-snow-300 flex flex-row items-center gap-2 justify-center leading-none font-semibold">
            <Icon sprite={faPlus} size="lg" />
            <p>Add new farm</p>
        </div>
    );
}
