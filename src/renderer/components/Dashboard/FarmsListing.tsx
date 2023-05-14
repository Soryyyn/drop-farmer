import { FarmRendererData } from '@df-types/farms.types';
import {
    faDownLeftAndUpRightToCenter,
    faMinimize,
    faPlus,
    faThumbTack,
    faTractor
} from '@fortawesome/free-solid-svg-icons';
import Icon from '@renderer/components/global/Icon';
import NavItem from '@renderer/components/global/Navigation/NavItem';
import { Overlays } from '@renderer/components/global/Overlay/types';
import {
    FarmContext,
    FarmContextProvider
} from '@renderer/contexts/FarmContext';
import { FarmsContext } from '@renderer/contexts/FarmsContext';
import { ModalContext } from '@renderer/contexts/ModalContext';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import { useOutsideAlterter } from '@renderer/hooks/useOutsideAlerter';
import { sortFarmsByStatus } from '@renderer/util/sort';
import clsx from 'clsx';
import React, {
    RefObject,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { useOverflowDetector } from 'react-detectable-overflow';
import SquareContainer from '../global/SquareContainer';
import StatusIndicator from './StatusIndicator';

function FarmItem() {
    const { farm } = useContext(FarmContext);

    return (
        <div className="p-2 bg-pepper-300 rounded-lg text-snow-300 w-fit min-w-[300px] flex flex-row gap-4 items-center font-semibold">
            <span className="whitespace-nowrap mr-auto ml-1">
                {window.api.removeTypeFromText(farm!.id)}
            </span>
            <StatusIndicator status={farm!.status} />
        </div>
    );
}

export default function FarmsListing() {
    const { sortedByStatus } = useContext(FarmsContext);
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);
    const { getSetting, updateSetting } = useContext(SettingsContext);

    const ref = useRef<HTMLDivElement>(null);
    const [displayingFarms, setDisplayingFarms] = useState(false);
    const { ref: farmsListingRef, overflow } = useOverflowDetector({});
    const [isFarming, setIsFarming] = useState(false);

    /**
     * If the farms are pinned.
     */
    const isPinned = getSetting('application', 'application-farmsPinned')
        ?.value!;

    useOutsideAlterter(ref, () => {
        if (!isPinned) {
            setDisplayingFarms(false);
        }
    });

    /**
     * Check if a farm has the status farming.
     */
    useEffect(() => {
        setIsFarming(
            sortedByStatus.some(
                (farm) =>
                    farm.status === 'farming' || farm.status === 'checking'
            )
        );
    }, [sortedByStatus]);

    return (
        <div className="relative" ref={ref}>
            <NavItem
                icon={faTractor}
                label="Farms"
                withBadge={isFarming}
                onClick={() => setDisplayingFarms(true)}
                className="bg-pepper-300 text-snow-300 hover:bg-pepper-400"
            />

            <div
                className={clsx(
                    'absolute -top-2 left-0 -translate-y-full mb-2 bg-pepper-300/40 backdrop-blur-sm rounded-lg flex flex-col p-2 gap-2',
                    {
                        hidden: !displayingFarms,
                        block: displayingFarms || isPinned
                    }
                )}
            >
                {sortedByStatus.length > 0 && (
                    <div
                        ref={farmsListingRef as RefObject<HTMLDivElement>}
                        className={clsx(
                            'flex gap-2 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-track-rounded-lg scrollbar-thumb-pepper-300 scrollbar-track-pepper-300/30',
                            {
                                'pr-2': overflow,
                                'flex-col h-full': isPinned,
                                'flex-col-reverse max-h-[300px]': !isPinned
                            }
                        )}
                    >
                        {sortedByStatus.map((farm) => (
                            <FarmContextProvider farm={farm} key={farm.id}>
                                <FarmItem />
                            </FarmContextProvider>
                        ))}
                    </div>
                )}

                {sortedByStatus.length > 0 && (
                    <span className="h-[2px] w-[95%] bg-pepper-300/20 self-center rounded-full" />
                )}

                <div className="flex flex-row gap-2 h-full">
                    <button
                        className="flex flex-row items-center justify-center bg-pepper-300 rounded-lg text-snow-300 p-2 gap-1 active:outline outline-2 outline-offset-2 outline-snow-300/50 transition-all hover:bg-pepper-400 font-medium grow"
                        onClick={() => {
                            setCurrentOverlay(Overlays.NewFarm);
                            toggleOverlay();

                            setDisplayingFarms(false);
                        }}
                    >
                        <Icon sprite={faPlus} size="1x" />
                        <p>Create new farm</p>
                    </button>
                    <SquareContainer
                        className="bg-pepper-300 !h-[40px] rounded-lg text-snow-300 active:outline outline-2 outline-offset-2 outline-snow-300/50 transition-all hover:bg-pepper-400"
                        onClick={() =>
                            updateSetting(
                                'application',
                                'application-farmsPinned',
                                !isPinned
                            )
                        }
                    >
                        <Icon
                            sprite={isPinned ? faMinimize : faThumbTack}
                            size="1x"
                        />
                    </SquareContainer>
                </div>
            </div>
        </div>
    );
}
