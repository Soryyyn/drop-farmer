import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef } from "react";
import Switch from "react-switch";
import styles from "./SettingItem.module.scss";

interface Props {
    setting: Setting,
    onChanged: (value: any) => void
}

export default function SettingItem({ setting, onChanged }: Props) {
    const numberInputRef = useRef<any>();

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
                borderRadius={5}
                activeBoxShadow="0 0 0 rgba(255,255,255,0)"
                disabled={setting.changingDisabled}
            />
        } else if (typeof setting.value === "number") {
            return <div className={styles.inputNumberContainer}>
                <button
                    disabled={setting.changingDisabled}
                    onClick={() => {
                        if (parseInt(numberInputRef.current.value) < 60) {
                            numberInputRef.current.value = (parseInt(numberInputRef.current.value) + 1).toString();
                            onChanged(parseInt(numberInputRef.current.value));
                        }
                    }}
                >
                    <FontAwesomeIcon
                        icon={faPlus}
                        size="sm"
                        className={styles.icon}
                        fixedWidth={true}
                    />
                </button>
                <input
                    ref={numberInputRef}
                    value={setting.value}
                    disabled={setting.changingDisabled}
                    type="number"
                    onInput={(event) => {
                        /**
                         * Check for NaN.
                         */
                        if (event.currentTarget.value == "")
                            event.currentTarget.value = "1";

                        let value = parseInt(event.currentTarget.value);

                        /**
                         * Check for min and max values.
                         */
                        if (value < setting.min!) {
                            value = 1;
                        } else if (value > setting.max!) {
                            value = 60;
                        }

                        onChanged(value);
                    }}
                />
                <button
                    disabled={setting.changingDisabled}
                    onClick={() => {
                        if (parseInt(numberInputRef.current.value) > 1) {
                            numberInputRef.current.value = (parseInt(numberInputRef.current.value) - 1).toString();
                            onChanged(parseInt(numberInputRef.current.value));
                        }
                    }}
                >
                    <FontAwesomeIcon
                        icon={faMinus}
                        size="sm"
                        className={styles.icon}
                        fixedWidth={true}
                    />
                </button>
            </div>
        } else if (typeof setting.value === "string") {
            return <input
                disabled={setting.changingDisabled}
                value={setting.value}
                type="text"
                onInput={(event) => {
                    onChanged(event.currentTarget.value);
                }}
            />
        }
    }

    return (
        <li className={styles.settingItem}>
            <div className={styles.details}>
                <p className={styles.title}>{setting.shownName} <i>{(setting.changingDisabled) ? "(Changing disabled)" : ""}</i></p>
                <p className={styles.desc}>{setting.description}</p>
            </div>
            <div className={styles.action}>
                {renderAction()}
            </div>
        </li>
    );
}