import React from "react";
import Switch from "react-switch";
import styles from "./SettingItem.module.scss";

interface Props {
    setting: Setting,
    onChanged: (value: any) => void
}

export default function SettingItem({ setting, onChanged }: Props) {
    /**
     * Decide which action to display based on type of the setting value.
     */
    function renderAction() {
        if (typeof setting.value == "boolean") {
            return <Switch
                onChange={(checked: boolean) => {
                    onChanged(checked);
                }}
                checked={setting.value}
                checkedIcon={false}
                uncheckedIcon={false}
                height={25}
                width={47}
                handleDiameter={17}
                offColor="#474e88"
                offHandleColor="#BAD5F1"
                onColor="#ff0044"
                onHandleColor="#fad2dd"
                className={styles.toggle}
                borderRadius={6}
            />
        } else if (typeof setting.value === "number") {
            return <input
                value={setting.value}
                type="number"
            />
        } else if (typeof setting.value === "string") {
            return <input
                value={setting.value}
                type="text"
            />
        }
    }

    return (
        <li className={styles.settingItem}>
            <div className={styles.details}>
                <p className={styles.title}>{setting.shownName}</p>
                <p className={styles.desc}>{setting.description}</p>
            </div>
            <div className={styles.action}>
                {renderAction()}
            </div>
        </li>
    );
}