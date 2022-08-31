import clsx from "clsx";
import React, { useCallback } from "react";
import styles from "../styles/IndicatorTag.module.scss";

interface Props {
    status: FarmStatus
}

/**
 * The indicator componenent of the farm.
 */
export default function IndicatorTag({ status }: Props) {

    /**
     * Get the indicator class for the current state.
     */
    const getIndicatorClass: (status: FarmStatus) => any = useCallback((status: FarmStatus) => {
        if (status === "disabled")
            return styles.disabled;
        else if (status === "idle")
            return styles.idle;
        else if (status === "checking")
            return styles.checking;
        else if (status === "farming")
            return styles.farming;
        else if (status === "attention-required")
            return styles["attention-required"];
    }, [status]);

    return (
        <div
            className={clsx(styles.container, getIndicatorClass(status))}
        >
            {status}
        </div>
    );
}