import Icon from '@components/global/Icon';
import NavItem from '@components/global/Navigation/NavItem';
import { Overlays } from '@components/global/Overlay/types';
import { FarmContext, FarmContextProvider } from '@contexts/FarmContext';
import { FarmsContext } from '@contexts/FarmsContext';
import { ModalContext } from '@contexts/ModalContext';
import { faPlus, faTractor } from '@fortawesome/free-solid-svg-icons';
import { useOutsideAlterter } from '@hooks/useOutsideAlerter';
import clsx from 'clsx';
import React, {
    RefObject,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';
import { useOverflowDetector } from 'react-detectable-overflow';
import StatusIndicator from './StatusIndicator';

function FarmItem() {
    const { farm } = useContext(FarmContext);

    return (
        <div className="p-2 bg-pepper-300 rounded-lg text-snow-300 w-fit min-w-[300px] flex flex-row gap-4 items-center font-semibold">
            <span className="whitespace-nowrap mr-auto">
                {api.removeTypeFromText(farm!.id)}
            </span>
            <StatusIndicator status={farm!.status} />
        </div>
    );
}

export default function FarmsListing() {
    const { farms } = useContext(FarmsContext);
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);

    const ref = useRef<HTMLDivElement>(null);
    const [displayingFarms, setDisplayingFarms] = useState(false);
    const { ref: farmsListingRef, overflow } = useOverflowDetector({});
    const [isFarming, setIsFarming] = useState(false);

    useOutsideAlterter(ref, () => setDisplayingFarms(false));

    /**
     * Check if a farm has the status farming.
     */
    useEffect(() => {
        setIsFarming(farms.some((farm) => farm.status === 'farming'));
    }, [farms]);

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
                        block: displayingFarms
                    }
                )}
            >
                {farms.length > 0 && (
                    <div
                        ref={farmsListingRef as RefObject<HTMLDivElement>}
                        className={clsx(
                            'flex flex-col-reverse gap-2 overflow-y-auto overflow-x-hidden',
                            {
                                'pr-0': overflow
                            }
                        )}
                    >
                        {farms.map((farm) => (
                            <FarmContextProvider farm={farm} key={farm.id}>
                                <FarmItem />
                            </FarmContextProvider>
                        ))}
                    </div>
                )}

                {farms.length > 0 && (
                    <span className="h-[2px] w-[95%] bg-pepper-300/20 self-center rounded-full" />
                )}

                <button
                    className="flex flex-row items-center justify-center bg-pepper-300 rounded-lg text-snow-300 p-2 gap-1 active:outline outline-2 outline-offset-2 outline-snow-300/50 transition-all hover:bg-pepper-400 font-medium"
                    onClick={() => {
                        setCurrentOverlay(Overlays.NewFarm);
                        toggleOverlay();

                        setDisplayingFarms(false);
                    }}
                >
                    <Icon sprite={faPlus} size="1x" />
                    <p>Create new farm</p>
                </button>
            </div>
        </div>
    );
}
