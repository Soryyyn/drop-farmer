import clsx from "clsx";
import React from "react";
import styles from "../styles/ButtonLabel.module.scss";

interface Props {
    imgPath: string,
    primary: boolean,
    label: string
    onClickAction: () => void
}

export default function ButtonLabel({ imgPath, primary, label, onClickAction }: Props) {
    return (
        <div
            className={clsx(styles.buttonContainer, (primary) ? styles.primary : styles.secondary)}
            onClick={onClickAction}
        >
            <img src={imgPath} draggable={false} />
            <p>{label}</p>
        </div>
    );
}