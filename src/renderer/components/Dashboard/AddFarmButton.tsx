import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Icon from '@renderer/components/global/Icon';
import { Overlays } from '@renderer/components/global/Overlay/types';
import { ModalContext } from '@renderer/contexts/ModalContext';
import React, { useContext } from 'react';

export default function AddFarmButton() {
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);

    return (
        <div
            className="h-[40px] bg-pepper-900/75 rounded-lg py-3 px-6 hover:bg-pepper-900 active:bg-pepper-800 active:text-snow-300 backdrop-blur-lg flex flex-row items-center gap-2 justify-center leading-none font-semibold cursor-pointer transition-all"
            onClick={() => {
                setCurrentOverlay(Overlays.NewFarm);
                toggleOverlay();
            }}
        >
            <Icon sprite={faPlus} size="lg" />
            <p className="leading-none font-semibold text-sm">Add new farm</p>
        </div>
    );
}
