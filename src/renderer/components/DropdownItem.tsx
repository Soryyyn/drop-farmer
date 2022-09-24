import clsx from "clsx";
import React from "react";
import styles from "../styles/DropdownItem.module.scss";

interface Props {
    label: string;
    disabled: boolean;
    action: () => void;
}

export default function DropdownItem({ label, disabled, action }: Props) {
    return (
        <div
            className={clsx(styles.container, (disabled ? styles.disabled : ""))}
            onClick={() => {
                if (!disabled)
                    action();
            }}
        >
            <p>{label}</p>
        </div >
    );
}