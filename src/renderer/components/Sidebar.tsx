import React, { useEffect, useState } from "react";
import styles from "../styles/Sidebar.module.scss";
import FarmItem from "./FarmItem";

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
                window.api.log("ERROR", `Error when setting farms. ${err}`);
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

            window.api.log("INFO", "Set new farms status");
        });

        return () => {
            window.api.removeAllListeners(window.api.channels.farmStatusChange)
        };
    }, [farms])

    return (
        <div className={styles.container}>
            <ul className={styles.items}>
                {
                    farms && farms.map((farm: FarmRendererObject) => {
                        return <FarmItem
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