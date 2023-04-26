import NavItem from '@components/global/Navigation/NavItem';
import { faTractor } from '@fortawesome/free-solid-svg-icons';
import { useOutsideAlterter } from '@hooks/useOutsideAlerter';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';

export default function FarmsListing() {
    const ref = useRef<HTMLDivElement>(null);
    const [displayingFarms, setDisplayingFarms] = useState(false);

    useOutsideAlterter(ref, () => setDisplayingFarms(false));

    return (
        <div className="relative" ref={ref}>
            <NavItem
                icon={faTractor}
                label="Farms"
                onClick={() => setDisplayingFarms(true)}
                className="bg-pepper-300 text-snow-300 hover:bg-pepper-400"
            />

            <div
                className={clsx(
                    'absolute -top-2 left-0 -translate-y-full mb-2 flex flex-col-reverse',
                    {
                        hidden: !displayingFarms,
                        block: displayingFarms
                    }
                )}
            >
                <p>asdasdasd</p>
                <p>fghfgh</p>
                <p>iouuioouiuio</p>
            </div>
        </div>
    );
}
