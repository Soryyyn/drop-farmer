import Icon from '@components/global/Icon';
import Tooltip from '@components/global/Tooltip';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import React, { useCallback } from 'react';

interface Props {
    status: FarmStatus;
}

export default function StatusIndicator({ status }: Props) {
    const getTooltipText = useCallback(() => {
        switch (status) {
            case 'disabled':
                return "This farm is currently disabled and won't farm. Enable it in the settings.";
            case 'idle':
                return 'This farm is currently idle and will wait until the next scheduled check should be performed.';
            case 'checking':
                return 'This farm is currently checking if it is possible to farm. The farm may require you to log in if needed.';
            case 'farming':
                return 'This farm is currently farming. The currently farming windows may be shown via the "eye-icon" on the right.';
            case 'attention-required':
                return 'This farm has encountered an error and requires user attention. If needed please, clear the farm cache or restart the farming';
            case 'condition-fulfilled':
                return "This farm has fulfilled it's conditions and will not farm, until the conditions are reset by the settings";
        }
    }, [status]);

    return (
        <Tooltip placement="bottom" text={getTooltipText()}>
            <div
                className={clsx(
                    'h-[33px] w-[33px] flex items-center justify-center text-pepper-200 aspect-square p-1 rounded',
                    {
                        'bg-blood-500': status === 'disabled',
                        'bg-sky-500': status === 'attention-required',
                        'bg-amber-500': status === 'idle',
                        'bg-pineapple-500': status === 'checking',
                        'bg-leaf-500': status === 'farming',
                        'bg-amethyst-500': status === 'condition-fulfilled'
                    }
                )}
            >
                <Icon sprite={faListCheck} size="1x" />
            </div>
        </Tooltip>
    );
}
