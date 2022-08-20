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
    return new Promise((resolve, reject) => {
        log("MAIN", "INFO", "Checking internet connection");

        isOnline()
            .then((connection: boolean) => {
                resolve(connection);
            });
    })

}

/**
 * Returns the current internet connection.
 */
export function getCurrentInternetConnection(): boolean {
    return internetConnection;
}
