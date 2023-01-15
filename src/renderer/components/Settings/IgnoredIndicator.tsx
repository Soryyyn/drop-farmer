import Tooltip from '@components/global/Tooltip';
import React from 'react';

interface Props {
    ignoredBy: string;
}

export default function IgnoredIndicator({ ignoredBy }: Props) {
    return (
        <Tooltip
            placement="bottom"
            text={`This setting is ignored by "${ignoredBy}" because it is set to a specific value`}
        >
            <div className="flex items-center bg-sky-500 py-1 px-2 rounded">
                <span className="text-pepper-200 font-semibold text-center leading-none text-sm flex flex-row gap-2">
                    IGNORED
                </span>
            </div>
        </Tooltip>
    );
}
