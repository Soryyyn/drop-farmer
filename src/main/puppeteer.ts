import { app } from "electron";
import puppeteer from "puppeteer-core";
import { connect, getPage, initialize } from "puppeteer-in-electron";

let browserConnection: puppeteer.Browser;

/**
 * Connects the puppeteer to the application devtools.
 */
export async function initPuppeteerConnection() {
    await initialize(app);
    browserConnection = await connect(app, puppeteer);
}

async function getBrowserConnection() {
    return browserConnection;
}

export async function controlWindow(window: Electron.BrowserWindow) {
    const browserConnection = await getBrowserConnection();
    return await getPage(browserConnection, window);
}
