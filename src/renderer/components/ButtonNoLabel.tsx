import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import React from "react";
import styles from "../styles/ButtonNoLabel.module.scss";


interface Props {
    icon: IconDefinition,
    primary: boolean,
    onClickAction: () => void
}

export default function ButtonNolabel({ icon, primary, onClickAction }: Props) {
    return (
        <div
            className={clsx(styles.buttonContainer, (primary) ? styles.primary : styles.secondary)}
            onClick={onClickAction}
        >
            <FontAwesomeIcon icon={icon} size="lg" className={styles.icon} />
        </div>
    );
}