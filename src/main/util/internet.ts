import isOnline from "is-online";
import { Channels } from "../common/channels";
import { sendOneWay } from "../electron/ipc";
import { sendToast } from "../electron/toast";
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

            /**
             * If user has no internet connection, notify via toast.
             */
            if (!connection)
                sendToast({
                    id: "no-internet",
                    type: "error",
                    body: "No internet connection.",
                    duration: Infinity
                });
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
