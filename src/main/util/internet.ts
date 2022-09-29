import isOnline from "is-online";
import { log } from "./logger";
import { sendForcedTypeToast } from "./toast";

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

            /**
             * If user has no internet connection, notify via toast.
             */
            if (!connection)
                sendForcedTypeToast({
                    id: "no-internet",
                    type: "error",
                    text: "No internet connection.",
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
