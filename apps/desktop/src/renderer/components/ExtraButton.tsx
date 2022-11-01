import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";
import React from "react";
import 'tippy.js/dist/tippy.css';
import styles from "../styles/ExtraButton.module.scss";
import Tooltip from "./Tooltip";

interface Props {
    icon: IconDefinition,
    tooltipText: string
    onClickAction: () => void
}

export default function ExtraButton({ icon, tooltipText, onClickAction }: Props) {
    return (
        <Tooltip
            tooltipText={tooltipText}
            placement="bottom"
        >
            <div
                className={styles.container}
                onClick={onClickAction}
            >
                <FontAwesomeIcon icon={icon} size="sm" className={styles.icon} />
            </div>
        </Tooltip>
    );
}