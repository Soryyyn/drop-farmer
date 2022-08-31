import clsx from "clsx";
import React from "react";
import styles from "../styles/ButtonNoLabel.module.scss";

interface Props {
    imgPath: string,
    primary: boolean,
    onClickAction: () => void
}

export default function ButtonNolabel({ imgPath, primary, onClickAction }: Props) {
    return (
        <div
            className={clsx(styles.buttonContainer, (primary) ? styles.primary : styles.secondary)}
            onClick={onClickAction}
        >
            <img src={imgPath} />
        </div>
    );
}