import NavItem from '@components/global/Navigation/NavItem';
import { FarmContext, FarmContextProvider } from '@contexts/FarmContext';
import { FarmsContext } from '@contexts/FarmsContext';
import { faTractor } from '@fortawesome/free-solid-svg-icons';
import { useOutsideAlterter } from '@hooks/useOutsideAlerter';
import clsx from 'clsx';
import React, { RefObject, useContext, useMemo, useRef, useState } from 'react';
import { useOverflowDetector } from 'react-detectable-overflow';
import StatusIndicator from './StatusIndicator';

function FarmItem() {
    const { farm } = useContext(FarmContext);

    return (
        <div className="p-2 pl-3 bg-pepper-300 rounded-lg text-snow-300 w-fit min-w-[300px] flex flex-row gap-4 items-center font-semibold">
            <span className="whitespace-nowrap mr-auto">
                {api.removeTypeFromText(farm!.id)}
            </span>
            <StatusIndicator status={farm!.status} />
        </div>
    );
}

export default function FarmsListing() {
    const ref = useRef<HTMLDivElement>(null);
    const [displayingFarms, setDisplayingFarms] = useState(false);
    const { farms } = useContext(FarmsContext);
    const { ref: farmsListingRef, overflow } = useOverflowDetector({});

    useOutsideAlterter(ref, () => setDisplayingFarms(false));

    /**
     * Check if a farm has the status farming.
     */
    const isAFarmFarming = useMemo(
        () => farms.some((farm) => farm.status === 'farming'),
        [farms]
    );

    return (
        <div className="relative" ref={ref}>
            <NavItem
                icon={faTractor}
                label="Farms"
                withBadge={isAFarmFarming}
                onClick={() => setDisplayingFarms(true)}
                className="bg-pepper-300 text-snow-300 hover:bg-pepper-400"
            />

            <div
                ref={farmsListingRef as RefObject<HTMLDivElement>}
                className={clsx(
                    'h-[288px] bg-pepper-300/30 absolute -top-2 left-0 -translate-y-full mb-2 flex flex-col-reverse gap-2 backdrop-blur-sm p-2 rounded-lg overflow-y-auto overflow-x-hidden',
                    {
                        'hidden': !displayingFarms,
                        'block': displayingFarms,
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
        </div>
    );
}
