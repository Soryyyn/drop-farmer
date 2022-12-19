import clsx from 'clsx';
import React, { useCallback } from 'react';
import styles from '../styles/IndicatorTag.module.scss';
import Tooltip from './global/Tooltip';

interface Props {
    status: FarmStatus;
}

/**
 * The indicator componenent of the farm.
 */
export default function IndicatorTag({ status }: Props) {
    /**
     * Get the indicator class for the current state.
     */
    const getIndicatorClass: (status: FarmStatus) => any = useCallback(
        (status: FarmStatus) => {
            if (status === 'disabled') return styles.disabled;
            else if (status === 'idle') return styles.idle;
            else if (status === 'checking') return styles.checking;
            else if (status === 'farming') return styles.farming;
            else if (status === 'attention-required')
                return styles['attention-required'];
        },
        [status]
    );

    /**
     *
     */
    const gettext: (status: FarmStatus) => any = useCallback(
        (status: FarmStatus) => {
            if (status === 'disabled')
                return "This farm is currently disabled and won't farm. Enable it in the settings.";
            else if (status === 'idle')
                return 'This farm is currently idle and will wait until the next scheduled check should be performed.';
            else if (status === 'checking')
                return 'This farm is currently checking if it is possible to farm. The farm may require you to log in if needed.';
            else if (status === 'farming')
                return 'This farm is currently farming. The currently farming windows may be shown via the "eye-icon" on the right.';
            else if (status === 'attention-required')
                return 'This farm has encountered an error and requires user attention. If needed please, clear the farm cache or restart the farming schedule.';
        },
        [status]
    );

    return (
        <Tooltip placement="bottom" text={gettext(status)}>
            <div className={clsx(styles.container, getIndicatorClass(status))}>
                {status}
            </div>
        </Tooltip>
    );
}
