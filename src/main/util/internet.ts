import isOnline from "is-online";
import { Channels } from "../common/channels";
import { sendOneWay } from "../electron/ipc";
import { getMainWindow } from "../electron/windows";
import { log } from "./logger";

/**
 * The current internet connection.
 */
let internetConnection: boolean = false;

/**
 * Repeatedly (every 5s) check the internet connection and notify via ipc.
 */
export function internetConnectionChecker(): void {
    isOnline()
        .then((connection: boolean) => {
            internetConnection = connection;
            sendOneWay(getMainWindow(), Channels.internetChange, connection);
        })
        .catch((err) => {
            log("MAIN", "FATAL", `Error checking internet connection. ${err}`);
        });

    /**
     * Recursive calling.
     */
    setTimeout(internetConnectionChecker, 15000);
}

/**
 * Returns the current internet connection.
 */
export async function getCurrentInternetConnection(): Promise<boolean> {
    return internetConnection;
}
