import React from "react";
import styles from "../styles/DropdownItem.module.scss";

interface Props {
    label: string;
    action: () => void;
}

export default function DropdownItem({ label, action }: Props) {
    return (
        <div
            className={styles.container}
            onClick={action}
        >
            <p>{label}</p>
        </div>
    );
}