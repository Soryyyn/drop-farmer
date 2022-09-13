import React from "react";
import styles from "../styles/SettingsItemDisabledBanner.module.scss";
import Tooltip from "./Tooltip";

export default function SettingsItemDisabledBanner() {
    return (
        <Tooltip
            tooltipText="This setting is disabled. User changes may break the farming."
            placement="bottom"
        >
            <div className={styles.container}>disabled</div>
        </Tooltip>
    );
}