import { app } from 'electron';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer-core';
import { connect, initialize } from 'puppeteer-in-electron';
import { log } from './logging';

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
    log('info', 'Connected puppeteer to electron application');
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
 */
export function enterIFrame(id: string, controlledPage: Page) {
    return new Promise<any>(async (resolve, reject) => {
        try {
            /**
             * Reload the page if the iframe is not found.
             */
            while ((await controlledPage.$('iframe')) == null) {
                log(
                    'info',
                    `${id}: Page needs to reload because iframe is not loaded`
                );
                await controlledPage.reload();
            }

            /**
             * Enter the iframe element.
             */
            await controlledPage
                .waitForSelector('iframe')
                .then(async (iframeHandle) => {
                    await controlledPage.waitForNetworkIdle();
                    log('info', `${id}: Endered iframe element`);
                    resolve(await iframeHandle!.contentFrame());
                });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Wait for a specific element to appear (or not) on the page.
 * Return either the element or null depending on if it appeared.
 */
export function waitForElementToAppear(
    controlledPage: Page,
    elementSelector: string,
    timeToWait: number = 30000
) {
    return new Promise<ElementHandle<Element> | null>(
        async (resolve, reject) => {
            try {
                try {
                    const element = await controlledPage.waitForSelector(
                        elementSelector,
                        {
                            timeout: timeToWait
                        }
                    );
                    resolve(element);
                } catch (err) {
                    resolve(null);
                }
            } catch (err) {
                reject(err);
            }
        }
    );
}

/**
 * Get a property from an element.
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

/**
 * If the current url contains a specific string.
 */
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

/**
 * If the current page title contains a specific string.
 */
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

/**
 * Get the tag name of an element.
 */
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

/**
 * Goto a url with retrying and optional delay.
 */
export function gotoURL(
    page: Page,
    url: string,
    timeout?: number
): Promise<void> {
    return new Promise(async (resolve) => {
        try {
            await page.goto(url);
            if (timeout) await waitForTimeout(timeout);
            resolve();
        } catch (error) {
            log('warn', 'Retrying to goto url');
            await gotoURL(page, url, timeout);
        }
    });
}
