import Tooltip from '@renderer/components/global/Tooltip';
import React from 'react';

export default function RestartIndicator() {
    return (
        <Tooltip
            placement="bottom"
            text="For this setting to take effect, you need to restart Drop Farmer"
        >
            <div className="flex items-center bg-gradient-to-tr from-amber-500 to-amber-550 py-1 px-2 rounded ">
                <p className="text-pepper-200 font-semibold text-center leading-none text-sm">
                    RESTART
                </p>
            </div>
        </Tooltip>
    );
}
