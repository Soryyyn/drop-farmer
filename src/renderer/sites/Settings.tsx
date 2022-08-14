import React, { useEffect, useState } from "react";

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
     * Get the settings file data from main process.
     */
    useEffect(() => {
        window.api.sendAndWait(window.api.channels.getSettings)
            .then((data: any) => {
                setSettings(data.appSettings);
                setFarmSettings(data.farmsSettings);
            })
            .catch((err) => {
                window.api.sendOneWay(window.api.channels.rendererError, err);
            });

        return () => {
            window.api.removeAllListeners(window.api.channels.getSettings)
        };
    }, []);

    return (
        <div id="settings-container">
            {settings && farmSettings &&
                <div>
                    {settings.toString()}
                    {farmSettings.toString()}
                </div>
            }
        </div>
    );
}