import { app } from "electron";
import puppeteer, { Browser, Frame, Page } from "puppeteer-core";
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
    log("MAIN", "DEBUG", "Connected puppeteer to electron application");
}

/**
 * Returns the connection to the electron application.
 */
export function getBrowserConnection(): Browser {
    return browserConnection;
}

/**
 * Manually implemented timeout waiting for use.
 */
export function waitForTimeout(timeout: number): Promise<void> {
    return new Promise((r) => setTimeout(r, timeout));
}

/**
 * Enter the iframe to control it.
 *
 * @param {string} gameName The name of the game currently running.
 * @param {Page} controlledPage The upper page which the iframe is on.
 */
export function enterIFrame(gameName: string, controlledPage: Page) {
    return new Promise<any>(async (resolve, reject) => {
        try {
            /**
             * Reload the page if the iframe is not found.
             */
            while ((await controlledPage.$("iframe")) == null) {
                log(
                    "MAIN",
                    "DEBUG",
                    `${gameName}: Page needs to reload because iframe is not loaded`
                );
                await controlledPage.reload();
            }

            /**
             * Enter the iframe element.
             */
            await controlledPage
                .waitForSelector("iframe")
                .then(async (iframeHandle) => {
                    await controlledPage.waitForNetworkIdle();
                    log("MAIN", "DEBUG", `${gameName}: Endered iframe element`);
                    resolve(await iframeHandle!.contentFrame());
                });
        } catch (err) {
            reject(err);
        }
    });
}
