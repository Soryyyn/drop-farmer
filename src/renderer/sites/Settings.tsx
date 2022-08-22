import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FarmSelector from "../components/FarmSelector";

/**
 * The route for the settings page.
 */
export default function Settings() {
    /**
     * The current settings state.
     */
    const [settings, setSettings] = useState<SettingsFile>();

    /**
     * Farm settings.
     */
    const [farmSettings, setFarmSettings] = useState<Farm[]>([]);

    /**
     * Set the currently selected settings selector.
     */
    const [selected, setSelected] = useState<string>("application");

    /**
     * Get the navigation from react router
     * to make navigation on button click possible.
     */
    const navigation = useNavigate();

    /**
     * Get the settings file data from main process.
     */
    useEffect(() => {
        window.api.log("INFO", "Rendering settings page");
        window.api.sendAndWait(window.api.channels.getSettings)
            .then((data: any) => {
                setSettings(data.appSettings);
                setFarmSettings(data.farmsSettings);
            })
            .catch((err) => {
                window.api.log("ERROR", `Error when setting settings for farms and app. ${err}`);
            });

        return () => {
            window.api.removeAllListeners(window.api.channels.getSettings)
        };
    }, []);

    /**
     * Load settings of either application or farm when a specific selector is pressed.
     */
    useEffect(() => {
        console.log(selected)
    }, [selected]);

    return (
        <div id="settings-container">
            {settings && farmSettings &&
                <div id="settings-content">
                    <div id="settings-topbar">
                        <button
                            onClick={() => {
                                navigation("/");
                                window.api.log("INFO", "Pressed home button on settings page");
                            }}
                        >
                            <img src="../assets/home.svg" />
                            <p>Home</p>
                        </button>
                        <h1>Settings</h1>
                        <button
                            onClick={() => {
                                console.log("saved");
                                window.api.log("INFO", "Pressed save button on settings page");
                            }}
                        >
                            <img src="../assets/save.svg" />
                            <p>Save</p>
                        </button>
                    </div>
                    <div id="settings-main-content">
                        <div id="settings-selectors">
                            <FarmSelector
                                selectorName="application"
                                handleClick={() => {
                                    setSelected("application");
                                }} />
                            <div id="settings-selector-seperator"></div>
                            {
                                farmSettings.map((farm: Farm) => {
                                    return (
                                        <FarmSelector
                                            selectorName={farm.gameName}
                                            key={farm.gameName}
                                            handleClick={() => {
                                                setSelected(farm.gameName);
                                            }}
                                        />
                                    );
                                })
                            }
                        </div>
                        <div id="farm-settings">
                            {selected}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}