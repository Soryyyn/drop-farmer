import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Switch from "react-switch";
import FarmSelector from "../components/FarmSelector";
import SettingsItemInput from "../components/SettingsItemInput";
import SettingsItemToggle from "../components/SettingsItemToggle";

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
     * The current farm settings to show.
     */
    const [showedSettings, setShowedSettings] = useState<Farm>({
        gameName: "undefined",
        checkerWebsite: "...",
        enabled: false,
        schedule: 30,
        uptime: 0
    });

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
        if (selected !== "application") {
            setShowedSettings(farmSettings.filter((farm) => farm.gameName === selected)[0])
        }
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
                                window.api.sendOneWay(window.api.channels.saveNewSettings, {
                                    appSettings: settings,
                                    farmsSettings: farmSettings
                                })
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
                                }}
                                currentlySelected={selected}
                            />
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
                                            currentlySelected={selected}
                                        />
                                    );
                                })
                            }
                        </div>
                        <div id="farm-settings">
                            {
                                /**
                                 * If the current selected settings to display
                                 * are the application settings.
                                 */
                                selected && selected === "application" &&
                                <>
                                    <SettingsItemToggle
                                        label="Launch drop-farmer on startup"
                                        checked={settings?.launchOnStartup}
                                        disabled={false}
                                        onClick={(checked: boolean) => {
                                            let tempSettings = { ...settings };
                                            tempSettings.launchOnStartup = checked;
                                            setSettings(tempSettings);
                                        }}
                                        description="Enable or disable if drop-farmer should be started when your PC has finished booting."
                                    />

                                    <SettingsItemToggle
                                        label="Show main window on launch"
                                        checked={settings?.showMainWindowOnLaunch}
                                        disabled={false}
                                        onClick={(checked: boolean) => {
                                            let tempSettings = { ...settings };
                                            tempSettings.showMainWindowOnLaunch = checked;
                                            setSettings(tempSettings);
                                        }}
                                        description="If the main window should be shown when drop-farmer starts."
                                    />

                                    <SettingsItemToggle
                                        label="Disable 3D model animations"
                                        checked={settings?.disable3DModuleAnimation}
                                        disabled={false}
                                        onClick={(checked: boolean) => {
                                            let tempSettings = { ...settings };
                                            tempSettings.disable3DModuleAnimation = checked;
                                            setSettings(tempSettings);
                                        }}
                                        description="Disable the 3D models animation on various pages (Home, etc.)."
                                    />
                                </>
                            }
                            {
                                /**
                                 * If the current selected settings to display
                                 * is a farm.
                                 */
                                selected && selected !== "application" &&
                                <>
                                    <SettingsItemToggle
                                        label="Farm enabled"
                                        checked={showedSettings.enabled}
                                        disabled={false}
                                        onClick={(checked: boolean) => {
                                            let tempFarmSettings: Farm = { ...showedSettings };
                                            let changesToApply: Farm[] = [...farmSettings];

                                            for (let i = 0; i < changesToApply.length; i++) {
                                                if (changesToApply[i].gameName === tempFarmSettings.gameName) {
                                                    tempFarmSettings.enabled = checked;
                                                    changesToApply[i] = tempFarmSettings;
                                                }
                                            }

                                            setShowedSettings(tempFarmSettings);
                                            setFarmSettings(changesToApply);
                                        }}
                                        description={`Enable or disable the ${showedSettings!.gameName} farm.`}
                                    />

                                    <SettingsItemInput
                                        label="Checker website"
                                        disabled={true}
                                        description="The website drop-farmer checks for the schedule, live matches, etc. to start farming."
                                        value={showedSettings.checkerWebsite}
                                        onInput={(newValue: string) => {
                                            let tempFarmSettings: Farm = { ...showedSettings };
                                            let changesToApply: Farm[] = [...farmSettings];

                                            for (let i = 0; i < changesToApply.length; i++) {
                                                if (changesToApply[i].gameName === tempFarmSettings.gameName) {
                                                    tempFarmSettings.checkerWebsite = newValue;
                                                    changesToApply[i] = tempFarmSettings;
                                                }
                                            }

                                            setShowedSettings(tempFarmSettings);
                                            setFarmSettings(changesToApply);
                                        }}
                                    />

                                    <SettingsItemInput
                                        label="Checking schedule"
                                        disabled={false}
                                        description="The schedule (in minutes) on which drop-farmer will check if farming is possible."
                                        value={showedSettings.schedule.toString()}
                                        onInput={(newValue: string) => {
                                            let tempFarmSettings: Farm = { ...showedSettings };
                                            let changesToApply: Farm[] = [...farmSettings];

                                            for (let i = 0; i < changesToApply.length; i++) {
                                                if (changesToApply[i].gameName === tempFarmSettings.gameName) {
                                                    tempFarmSettings.schedule = parseInt(newValue);
                                                    changesToApply[i] = tempFarmSettings;
                                                }
                                            }

                                            setShowedSettings(tempFarmSettings);
                                            setFarmSettings(changesToApply);
                                        }}
                                    />
                                </>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}