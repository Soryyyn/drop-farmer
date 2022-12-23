import { Icon } from '@components/global/Icon';
import Tooltip from '@components/global/Tooltip';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import React, { useCallback } from 'react';

interface Props {
    status: FarmStatus;
}

export default function StatusIndicator({ status }: Props) {
    const getTooltipText = useCallback(() => {
        if (status === 'disabled')
            return "This farm is currently disabled and won't farm. Enable it in the settings.";
        else if (status === 'idle')
            return 'This farm is currently idle and will wait until the next scheduled check should be performed.';
        else if (status === 'checking')
            return 'This farm is currently checking if it is possible to farm. The farm may require you to log in if needed.';
        else if (status === 'farming')
            return 'This farm is currently farming. The currently farming windows may be shown via the "eye-icon" on the right.';
        else if (status === 'attention-required')
            return 'This farm has encountered an error and requires user attention. If needed please, clear the farm cache or restart the farming';
        else return '';
    }, [status]);

    return (
        <Tooltip placement="bottom" text={getTooltipText()}>
            <div
                className={clsx(
                    'h-[33px] w-[33px] flex items-center justify-center text-pepper-200 aspect-square p-1 rounded shadow-md',
                    {
                        'bg-blood-500 shadow-blood-500/30':
                            status === 'disabled',
                        'bg-sky-500 shadow-sky-500/30':
                            status === 'attention-required',
                        'bg-amber-500 shadow-amber-500/30': status === 'idle',
                        'bg-pineapple-500 shadow-pineapple-500/30':
                            status === 'checking',
                        'bg-leaf-500 shadow-leaf-500/30': status === 'farming'
                    }
                )}
            >
                <Icon sprite={faInfo} size="1x" />
            </div>
        </Tooltip>
    );
}
