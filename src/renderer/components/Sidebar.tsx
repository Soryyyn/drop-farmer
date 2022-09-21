import React, { useEffect, useState } from "react";
import { useHandleOneWay } from "../hooks/useHandleOneWay";
import { useSendAndWait } from "../hooks/useSendAndWait";
import styles from "../styles/Sidebar.module.scss";
import FarmItem from "./FarmItem";

/**
 * The sidebar component which displays all farms and their status.
 */
export default function Sidebar() {
    /**
     * The current farms from main process.
     */
    const [farms, setFarms] = useState<newFarmRendererObject[]>([]);

    useSendAndWait(window.api.channels.getFarms, null, (err, response) => {
        if (err) {
            window.api.log("ERROR", err);
        } else {
            setFarms(response);
        }
    });

    /**
     * Handle the call from main when the farms are being checked for farming.
     *
     * - Check if the changed status of farm is the current one, if not ignore.
     * - If it is this one, then change the status.
     */
    useHandleOneWay(window.api.channels.farmStatusChange, farms, (event, data) => {
        /**
         * Create empty array for the state.
         */
        let tempCopy: newFarmRendererObject[] = [];

        /**
         * Check which farm had a status change.
         */
        for (let i = 0; i < farms.length; i++) {
            if (farms[i].name === data.name) {
                /**
                 * Clear the temporary state to apply latest changes to states.
                 */
                tempCopy = [];
                tempCopy = [...farms];
                tempCopy[i] = data;
            }
        }

        /**
         * Set the state after going through each farm.
         */
        setFarms(tempCopy);
        window.api.log("DEBUG", "Set new farms status");
    });

    return (
        <div className={styles.container}>
            <ul className={styles.items}>
                {
                    farms && farms.map((farm: newFarmRendererObject) => {
                        return <FarmItem
                            key={farm.name}
                            name={farm.name}
                            status={farm.status}
                        />
                    })
                }
            </ul>
        </div>
    );
}