import { app } from "electron";
import { resolve } from "path";
import puppeteer, { Browser, ElementHandle, Frame, Page } from "puppeteer-core";
import { connect, initialize } from "puppeteer-in-electron";
import { log } from "./logger";

/**
 * The connection to the electron application.
 */
let browserConnection: puppeteer.Browser;

/**
 * (Re-) Connect the puppeteer controller to the electron app.
 */
export async function connectToElectron() {
    browserConnection = await connect(app, puppeteer);
}

/**
 * Connects the puppeteer to the application devtools.
 */
export async function initPuppeteerConnection() {
    await initialize(app);
    connectToElectron();
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
 *
 * @param {number} timeout The amount of time to wait before continuing (in ms).
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

/**
 * Wait for a specific element to appear (or not) on the page.
 * Return either true if the element has appeared, or false if it hasn't.
 *
 * @param {Page} controlledPage The page which is already controlled.
 * @param {string} elementSelector The element selector to wait to appear.
 * @param {number} timeToWait The number of milliseconds to wait for the element
 * to appear. 0 is infinite.
 */
export function waitForElementToAppear(
    controlledPage: Page,
    elementSelector: string,
    timeToWait: number = 30000
) {
    return new Promise<ElementHandle<Element> | undefined>(
        async (resolve, reject) => {
            try {
                try {
                    const element = await controlledPage.waitForSelector(
                        elementSelector,
                        {
                            timeout: timeToWait
                        }
                    );
                    resolve(element ?? undefined);
                } catch (err) {
                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        }
    );
}

/**
 * Get a property from an element.
 *
 * @param element The element to get the property from.
 * @param property The property to get.
 */
export function getElementProperty(
    element: ElementHandle<any>,
    property: string
) {
    return new Promise<string>(async (resolve, reject) => {
        try {
            resolve(await (await element.getProperty(property)).jsonValue());
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Check if an element exists at this point in time.
 *
 * @param controlledPage The controlled page.
 * @param selector The selector to check for.
 */
export function doesElementExist(
    controlledPage: Page,
    selector: string
): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            try {
                const exists = (await controlledPage.$(selector)) !== null;
                resolve(exists);
            } catch (error) {
                resolve(false);
            }
        } catch (err) {
            reject(err);
        }
    });
}

export function pageUrlContains(
    controlledPage: Page,
    contains: string
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            resolve(controlledPage.url().includes(contains));
        } catch (error) {
            reject(error);
        }
    });
}

export function pageTitleContains(
    controlledPage: Page,
    contains: string
): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            resolve((await controlledPage.title()).includes(contains));
        } catch (error) {
            reject(error);
        }
    });
}

export function getElementTagName(
    controlledPage: Page,
    element: ElementHandle<Element>
) {
    return new Promise<string>(async (resolve, reject) => {
        try {
            resolve(controlledPage.evaluate((el) => el!.tagName, element));
        } catch (error) {
            reject(error);
        }
    });
}
