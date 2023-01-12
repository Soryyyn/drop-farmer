import { Icon } from '@components/global/Icon';
import { Overlays } from '@components/global/Overlay/types';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ModalContext } from '@renderer/util/contexts';
import React, { useContext } from 'react';

export default function AddFarmButton() {
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);

    return (
        <div
            className="bg-pepper-900/75 rounded-lg py-4 px-8 hover:bg-pepper-900 active:bg-pepper-800 active:text-snow-300 flex flex-row items-center gap-2 justify-center leading-none font-semibold"
            onClick={() => {
                setCurrentOverlay(Overlays.NewFarm);
                toggleOverlay();
            }}
        >
            <Icon sprite={faPlus} size="lg" />
            <p>Add new farm</p>
        </div>
    );
}
