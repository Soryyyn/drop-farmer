import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useSendAndWait } from "../../util/hooks";
import SettingItem from "./SettingItem";
import styles from "./Settings.module.scss";

export default function Settings() {
    const [currentlySelected, setCurrentlySelected] = useState<string>("application");
    const [selectors, setSelectors] = useState<string[]>([]);
    const [settings, setSettings] = useState<Settings>();

    /**
     * Get the settings file data from main process.
     */
    useSendAndWait(window.api.channels.getSettings, null, (err, response) => {
        if (!err) {
            setSelectors(Object.keys(response));
            setSettings(response);
        }
    });

    return (
        <>
            {selectors && settings &&
                <div className={styles.splitterContainer}>
                    <ul className={styles.settingsSelectors}>
                        {
                            selectors.map((selector) => {
                                return <li
                                    className={clsx(styles.selector, (currentlySelected === selector) ? styles.selectorSelected : null)}
                                    key={selector}
                                    onClick={() => {
                                        setCurrentlySelected(selector);
                                    }}
                                >{selector}</li>
                            })
                        }
                    </ul>
                    <ul className={styles.settingsItems}>
                        {
                            settings[currentlySelected].map((setting) => {
                                return <SettingItem
                                    key={setting.name}
                                    setting={setting}
                                    onChanged={(value: any) => {
                                        /**
                                         * Apply the changed setting to a copy
                                         * of the settings.
                                         * Then set the settings as the just
                                         * changed copy.
                                         */
                                        let copyOfSettings = { ...settings };
                                        let newFarmSetting = { ...setting };

                                        copyOfSettings[currentlySelected].forEach((s) => {
                                            if (newFarmSetting.name === s.name) {
                                                s.value = value;
                                                s = newFarmSetting;
                                            }
                                        });

                                        setSettings(copyOfSettings);
                                    }}
                                />
                            })
                        }
                    </ul>
                </div>
            }
        </>
    );
}