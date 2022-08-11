import { app } from "electron";
import puppeteer, { Browser } from "puppeteer-core";
import { connect, initialize } from "puppeteer-in-electron";
import { log } from "./logger";

/**
 * The connection to the electron application.
 */
let browserConnection: puppeteer.Browser;

/**
 * Connects the puppeteer to the application devtools.
 */
export async function initPuppeteerConnection() {
    await initialize(app);
    browserConnection = await connect(app, puppeteer);
    log("INFO", "Connected puppeteer to electron application");
}

/**
 * Returns the connection to the electron application.
 */
export function getBrowserConnection(): Browser {
    return browserConnection;
}
