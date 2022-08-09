import isOnline from "is-online";
import { log } from "./logger";

/**
 * The current internet connection.
 */
let internetConnection: boolean = false;

/**
 * Check the current internet connection.
 */
export function checkInternetConnection(): void {
    log("INFO", "Checking internet connection");

    isOnline()
        .then((connection: boolean) => {
            internetConnection = connection;
        });
}

/**
 * Returns the current internet connection.
 */
export function getCurrentInternetConnection(): boolean {
    return internetConnection;
}
