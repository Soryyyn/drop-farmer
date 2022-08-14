import React, { useEffect, useState } from "react";
import FarmStatus from "./FarmStatus";

/**
 * The sidebar component which displays all farms and their status.
 */
export default function Sidebar() {
    /**
     * The current farms from main process.
     */
    const [farms, setFarms] = useState<FarmRendererObject[]>([]);

    /**
     * On site load, get all farms from main process and display the enabled ones.
     */
    useEffect(() => {
        window.api.sendAndWait(window.api.channels.getFarms)
            .then((data: any) => {
                setFarms(data);
            })
            .catch((err) => {
                window.api.sendOneWay(window.api.channels.rendererError, err);
            });

        return () => {
            window.api.removeAllListeners(window.api.channels.getFarms)
        };
    }, []);

    /**
     * Handle the call from main when the farms are being checked for farming.
     *
     * - Check if the changed status of farm is the current one, if not ignore.
     * - If it is this one, then change the status.
     */
    useEffect(() => {
        window.api.handleOneWay(window.api.channels.farmStatusChange, (event: Electron.IpcRendererEvent, changedStatus: FarmRendererObject) => {

            /**
             * Create empty array for the state.
             */
            let tempCopy: FarmRendererObject[] = [];

            /**
             * Check which farm had a status change.
             */
            for (let i = 0; i < farms.length; i++) {

                if (farms[i].gameName === changedStatus.gameName) {
                    /**
                     * Clear the temporary state to apply latest changes to states.
                     */
                    tempCopy = [];
                    tempCopy = [...farms];
                    tempCopy[i] = changedStatus;
                }
            }

            /**
             * Set the state after going through each farm.
             */
            setFarms(tempCopy);
        });

        return () => {
            window.api.removeAllListeners(window.api.channels.farmStatusChange)
        };
    }, [farms])

    return (
        <div id="sidebar">
            <ul>
                {
                    farms && farms.map((farm: FarmRendererObject) => {
                        return <FarmStatus
                            key={farm.gameName}
                            farm={farm}
                            status={farm.status}
                        />
                    })
                }
            </ul>
        </div>
    );
}