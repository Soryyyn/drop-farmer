import Tooltip from '@components/global/Tooltip';
import React from 'react';

export default function DisabledIndicator() {
    return (
        <Tooltip placement="bottom" text="This setting can't be changed">
            <div className="flex items-center bg-blood-500 py-1 px-2 rounded ">
                <p className="text-pepper-200 font-semibold text-center leading-none text-sm">
                    DISABLED
                </p>
            </div>
        </Tooltip>
    );
}
