import ChangelogRenderer from '@components/global/ChangelogRenderer';
import Popup from '@components/global/Popup';
import { useAppVersion } from '@hooks/useAppVersion';
import React, { useState } from 'react';

export default function Subtitle() {
    const [isChangelogShowing, setIsChangelogShowing] = useState(false);
    const appVersion = useAppVersion();

    return (
        <>
            <span className="text-center w-fit self-center text-pepper-200/75 -mt-1 font-medium flex flex-row gap-1 items-center">
                <p className="px-1">v{appVersion}</p>
                <p>-</p>
                <p
                    className="hover:bg-pepper-900/50 rounded px-1 py-0.5 cursor-pointer transition-all"
                    onClick={() => setIsChangelogShowing(true)}
                >
                    Changelog
                </p>
            </span>

            <Popup
                showing={isChangelogShowing}
                title="Changelog"
                onClose={() => setIsChangelogShowing(false)}
            >
                <ChangelogRenderer />
            </Popup>
        </>
    );
}
