import { faHome, faSave } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonLabel from "../components/ButtonLabel";
import FarmSelector from "../components/FarmSelector";
import SettingsItemButton from "../components/SettingsItemButton";
import SettingsItemInput from "../components/SettingsItemInput";
import SettingsItemToggle from "../components/SettingsItemToggle";
import styles from "../styles/Settings.module.scss";


/**
 * The route for the settings page.
 */
export default function Settings() {
    /**
     * The current settings state.
     */
    const [applicationSettings, setApplicationSettings] = useState<ApplicationSettings>();

    /**
     * Farm settings.
     */
    const [farmSettings, setFarmSettings] = useState<FarmSaveData[]>([]);

    /**
     * Set the currently selected settings selector.
     */
    const [selected, setSelected] = useState<string>("application");

    /**
     * The current farm settings to show.
     */
    const [showedSettings, setShowedSettings] = useState<FarmSaveData>({
        enabled: false,
        type: "default",
        name: "undefined",
        checkerWebsite: "undefined",
        checkingSchedule: 0,
        uptime: 0,
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
        window.api.log("DEBUG", "Rendering settings page");
        window.api.sendAndWait(window.api.channels.getSettings)
            .then((data: any) => {
                setApplicationSettings(data.applicationSettings);
                setFarmSettings(data.farmSettings);
            })
            .catch((err) => {
                window.api.log("ERROR", `Error when setting settings for farms and app. ${err}`);
            });

        return () => {
            window.api.removeAllListeners(window.api.channels.getSettings);
        };
    }, []);

    /**
     * Load settings of either application or farm when a specific selector is pressed.
     */
    useEffect(() => {
        if (selected !== "application") {
            setShowedSettings(farmSettings.filter((farm) => farm.name === selected)[0])
        }
    }, [selected]);

    return (
        <>
            {applicationSettings && farmSettings &&
                <>
                    <div className={styles.topBar}>
                        <ButtonLabel
                            icon={faHome}
                            primary={false}
                            label="Home"
                            onClickAction={() => {
                                window.api.log("DEBUG", "Pressed home button on settings page");
                                navigation("/");
                            }}
                        />
                        <h1>Settings</h1>
                        <ButtonLabel
                            icon={faSave}
                            primary={false}
                            label="Save"
                            onClickAction={() => {
                                window.api.sendOneWay(window.api.channels.saveNewSettings, {
                                    applicationSettings: applicationSettings,
                                    farmSettings: farmSettings
                                })
                                window.api.log("DEBUG", "Pressed save button on settings page");
                            }}
                        />
                    </div>
                    <div className={styles.container}>
                        <div className={styles.left}>
                            <div className={styles.selectors}>
                                <FarmSelector
                                    selectorName="application"
                                    handleClick={() => {
                                        setSelected("application");
                                    }}
                                    currentlySelected={selected}
                                />
                                <div className={styles.seperator}></div>
                                {
                                    farmSettings.map((farm: FarmSaveData) => {
                                        return (
                                            <FarmSelector
                                                selectorName={farm.name}
                                                key={farm.name}
                                                handleClick={() => {
                                                    setSelected(farm.name);
                                                }}
                                                currentlySelected={selected}
                                            />
                                        );
                                    })
                                }
                            </div>
                        </div>
                        <div className={styles.right}>
                            {
                                /**
                                 * If the current selected settings to display
                                 * are the application settings.
                                 */
                                selected && selected === "application" &&
                                <>
                                    <SettingsItemToggle
                                        label="Launch drop-farmer on startup"
                                        checked={applicationSettings?.launchOnStartup}
                                        disabled={false}
                                        onClick={(checked: boolean) => {
                                            let tempSettings = { ...applicationSettings };
                                            tempSettings.launchOnStartup = checked;
                                            setApplicationSettings(tempSettings);
                                        }}
                                        description="Enable or disable if drop-farmer should be started when your PC has finished booting."
                                    />

                                    <SettingsItemToggle
                                        label="Show main window on launch"
                                        checked={applicationSettings?.showMainWindowOnLaunch}
                                        disabled={false}
                                        onClick={(checked: boolean) => {
                                            let tempSettings = { ...applicationSettings };
                                            tempSettings.showMainWindowOnLaunch = checked;
                                            setApplicationSettings(tempSettings);
                                        }}
                                        description="If the main window should be shown when drop-farmer starts."
                                    />

                                    <SettingsItemToggle
                                        label="Disable 3D model animations"
                                        checked={applicationSettings?.disable3DModelAnimation}
                                        disabled={false}
                                        onClick={(checked: boolean) => {
                                            let tempSettings = { ...applicationSettings };
                                            tempSettings.disable3DModelAnimation = checked;
                                            setApplicationSettings(tempSettings);
                                        }}
                                        description="Disable the 3D models animation on various pages (Home, etc.)."
                                    />

                                    <SettingsItemToggle
                                        label="Enable debug logging"
                                        checked={applicationSettings?.debugLogs}
                                        disabled={false}
                                        onClick={(checked: boolean) => {
                                            let tempSettings = { ...applicationSettings };
                                            tempSettings.debugLogs = checked;
                                            setApplicationSettings(tempSettings);
                                        }}
                                        description="Enable the debug logs. Use for debugging or reporting errors."
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
                                            let tempFarmSettings: FarmSaveData = { ...showedSettings };
                                            let changesToApply: FarmSaveData[] = [...farmSettings];

                                            for (let i = 0; i < changesToApply.length; i++) {
                                                if (changesToApply[i].name === tempFarmSettings.name) {
                                                    tempFarmSettings.enabled = checked;
                                                    changesToApply[i] = tempFarmSettings;
                                                }
                                            }

                                            setShowedSettings(tempFarmSettings);
                                            setFarmSettings(changesToApply);
                                        }}
                                        description={`Enable or disable the ${showedSettings!.name} farm.`}
                                    />

                                    <SettingsItemInput
                                        label="Checker website"
                                        disabled={true}
                                        description="The website drop-farmer checks for the schedule, live matches, etc. to start farming."
                                        value={showedSettings.checkerWebsite}
                                        onInput={(newValue: string) => {
                                            let tempFarmSettings: FarmSaveData = { ...showedSettings };
                                            let changesToApply: FarmSaveData[] = [...farmSettings];

                                            for (let i = 0; i < changesToApply.length; i++) {
                                                if (changesToApply[i].name === tempFarmSettings.name) {
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
                                        value={showedSettings.checkingSchedule.toString()}
                                        onInput={(newValue: string) => {
                                            let tempFarmSettings: FarmSaveData = { ...showedSettings };
                                            let changesToApply: FarmSaveData[] = [...farmSettings];

                                            for (let i = 0; i < changesToApply.length; i++) {
                                                if (changesToApply[i].name === tempFarmSettings.name) {
                                                    tempFarmSettings.checkingSchedule = parseInt(newValue);
                                                    changesToApply[i] = tempFarmSettings;
                                                }
                                            }

                                            setShowedSettings(tempFarmSettings);
                                            setFarmSettings(changesToApply);
                                        }}
                                    />

                                    {/*
                                        If farm is custom type.
                                    */}
                                    {(showedSettings.type != "default") &&
                                        <SettingsItemButton
                                            label="Delete farm"
                                            disabled={false}
                                            description="Delete this farm. It's configuration and history data will be deleted too."
                                            buttonLabel="Delete"
                                            onClick={() => {
                                                window.api.sendAndWait(window.api.channels.deleteFarm, showedSettings.name)
                                                    .then((farms: any) => {
                                                        /**
                                                         * Set the farm settings
                                                         * and the currently
                                                         * selected to application.
                                                         */
                                                        setFarmSettings(farms);
                                                        setSelected("application");
                                                    })
                                            }}
                                        />
                                    }
                                </>
                            }
                        </div>
                    </div>
                </>
            }
        </>
    );
}