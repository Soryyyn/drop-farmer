import { app } from "electron";
import puppeteer from "puppeteer-core";
import { connect, initialize } from "puppeteer-in-electron";

/**
 * Connects the puppeteer to the application devtools.
 */
export async function initPuppeteerConnection() {
    await initialize(app);
    return await connect(app, puppeteer);
}
