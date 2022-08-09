import { app } from "electron";
import puppeteer from "puppeteer-core";
import { connect, getPage, initialize } from "puppeteer-in-electron";
import { log } from "./logger";

let browserConnection: puppeteer.Browser;

/**
 * Connects the puppeteer to the application devtools.
 */
export async function initPuppeteerConnection() {
    await initialize(app);
    browserConnection = await connect(app, puppeteer);
    log("INFO", "Connected puppeteer to electron application");
}

async function getBrowserConnection() {
    return browserConnection;
}

export async function controlWindow(window: Electron.BrowserWindow) {
    const browserConnection = await getBrowserConnection();
    log("INFO", `Connected to window`);
    return await getPage(browserConnection, window);
}
