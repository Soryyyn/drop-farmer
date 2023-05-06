import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { useAppVersion } from '@renderer/chooks/useAppVersion';
import Icon from '@renderer/components/global/Icon';
import Tooltip from '@renderer/components/global/Tooltip';
import React from 'react';

export default function AboutButton() {
    const appVersion = useAppVersion();

    return (
        <Tooltip
            text={
                <>
                    Version: {appVersion}
                    <br />© Soryn
                </>
            }
            placement="left"
        >
            <div className="bg-snow-300/20 hover:bg-snow-300/30 text-snow-500/80 hover:text-snow-500 aspect-square flex items-center justify-center p-1 rounded-lg">
                <Icon sprite={faQuestion} size="sm" />
            </div>
        </Tooltip>
    );
}
