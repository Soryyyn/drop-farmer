import React from "react";
import styles from "../styles/FarmActionButton.module.scss";


interface Props {
    label: string;
    handleClick: () => void
}

export default function FarmActionButton({ label, handleClick }: Props) {
    return (
        <div
            className={styles.container}
            onClick={handleClick}
        >
            {label}
        </div>
    );
}