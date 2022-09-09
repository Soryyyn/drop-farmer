import isOnline from "is-online";
import { log } from "./logger";

/**
 * The current internet connection.
 */
let internetConnection: boolean = false;

/**
 * Check the current internet connection.
 */
export async function checkInternetConnection() {
    return new Promise((resolve) => {
        log("MAIN", "INFO", "Checking internet connection");

        isOnline()
            .then((connection: boolean) => {
                resolve(connection);
            })
            .catch((err) => {
                log("MAIN", "FATAL", `Error checking internet connection. ${err}`);
            });
    });
}

/**
 * Returns the current internet connection.
 */
export async function getCurrentInternetConnection(): Promise<boolean> {
    await checkInternetConnection();
    return internetConnection;
}
