import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import styles from "../styles/Sidebar.module.scss";
import { useHandleOneWay } from "../util/hooks/useHandleOneWay";
import { useSendAndWait } from "../util/hooks/useSendAndWait";
import FarmItem from "./FarmItem";

/**
 * The sidebar component which displays all farms and their status.
 */
export default function Sidebar() {
    /**
     * The current farms from main process.
     */
    const [farms, setFarms] = useState<FarmRendererObject[]>([]);

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
        let tempCopy: FarmRendererObject[] = [];

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
        <div className={styles.upperContainer}>
            <div className={styles.container}>
                <ul className={styles.items}>
                    {
                        farms && farms.map((farm: FarmRendererObject) => {
                            return <FarmItem
                                key={farm.name}
                                name={farm.name}
                                type={farm.type}
                                status={farm.status}
                            />
                        })
                    }
                </ul>
            </div>
            <button
                className={styles.addFarmButton}
            >
                <FontAwesomeIcon icon={faPlus} size="lg" className={styles.icon} />
                Add farm
            </button>
        </div>
    );
}