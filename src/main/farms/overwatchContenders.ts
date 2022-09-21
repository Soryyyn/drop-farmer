import { getPage } from "puppeteer-in-electron";
import { log } from "../util/logger";
import { getBrowserConnection } from "../util/puppeteer";
import FarmTemplate from "./template";

export default class OverwatchContenders extends FarmTemplate {

    constructor() {
        super(
            "overwatch-contenders",
            "https://www.youtube.com/c/OverwatchContenders"
        );
    }

    /**
     * Login on the yt website for drops.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                let page = await getPage(getBrowserConnection(), window);
                await page.waitForNetworkIdle();

                /**
                 * Check if user agreement acception is needed.
                 */
                if (await page.$("#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.qqtRac > div.VtwTSb > form:nth-child(3) > div > div > button > div.VfPpkd-RLmnJb") != null) {
                    await page.click("#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.qqtRac > div.VtwTSb > form:nth-child(3) > div > div > button > div.VfPpkd-RLmnJb");
                    log("MAIN", "INFO", `${this.getName()}: Accepted user agreement`);
                    await page.waitForNavigation();
                }

                await page.waitForNetworkIdle();
                await page.waitForTimeout(2000);

                /**
                 * Check if not logged in logged in.
                 */
                if (await page.$("#buttons > ytd-button-renderer > a") != null) {
                    /**
                     * Login needed.
                     */
                    await page.click("#buttons > ytd-button-renderer > a");
                    await page.waitForNetworkIdle();

                    log("MAIN", "DEBUG", `${this.getName()}: Login is needed by user`);

                    /**
                     * Open checker window for user login.
                     */
                    window.show();
                    window.focus();

                    /**
                     * Wait until user is back at account page by waiting for
                     * the yt banner.
                     */
                    page.waitForSelector("#contentContainer > div.banner-visible-area.style-scope.ytd-c4-tabbed-header-renderer", { timeout: 0 })
                        .then(() => {
                            log("MAIN", "DEBUG", `${this.getName()}: Login completed`);
                            window.hide();
                            resolve(undefined);
                        });
                } else {
                    /**
                     * Login not needed.
                     */
                    log("MAIN", "DEBUG", `${this.getName()}: User already logged in, continuing`);
                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Check if farm can still farm.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    windowsStillFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                if (this.getFarmingWindows().length === 0) {
                    log("MAIN", "DEBUG", `${this.getName()}: No farming windows, skipping checking step`);
                    resolve(undefined);
                } else {
                    let page = await getPage(getBrowserConnection(), window);
                    await page.waitForNetworkIdle();

                    /**
                     * Check if there are any livestreams.
                     * If there are none, close the farming window.
                     */
                    if (await page.$("ytd-thumbnail-overlay-time-status-renderer[overlay-style=LIVE]") != null) {
                        log("MAIN", "DEBUG", `${this.getName()}: Stream still live, continue farming`);
                        resolve(undefined);
                    } else {
                        this.removeFarmingWindowFromArray(0);

                        log("MAIN", "DEBUG", `${this.getName()}: Stream not live anymore, stopping farming`);

                        resolve(undefined);
                    }
                }
            } catch (err) {
                reject(err);
            }
        })
    }

    /**
     * Start farming.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    startFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                let page = await getPage(getBrowserConnection(), window);
                await page.waitForNetworkIdle();

                /**
                 * Check if farming windows exist, if yes don't try to check for new stream.
                 */
                if (this.getFarmingWindows().length > 0) {
                    log("MAIN", "DEBUG", `${this.getName()}: Already farming, no need to start again`);

                    this.updateStatus("farming");
                    resolve(undefined);
                } else {
                    /**
                     * Check if there is a "LIVE" element / current livestream.
                     */
                    if (await page.$("ytd-thumbnail-overlay-time-status-renderer[overlay-style=LIVE]") != null) {
                        log("MAIN", "DEBUG", `${this.getName()}: Found livestream`);

                        /**
                         * Create the farming window and open the livestream.
                         */
                        this.createFarmingWindow(this.getCheckerWebsite())
                            .then(async (farmingWindow) => {
                                let farmingWindowPage = await getPage(getBrowserConnection(), farmingWindow);

                                await farmingWindowPage.waitForNetworkIdle();
                                await farmingWindowPage.waitForTimeout(2000);

                                /**
                                 * Click on the first video element which is found.
                                 * In case of a livestream it is always the
                                 * first one.
                                 */
                                await farmingWindowPage.click("#contents > ytd-video-renderer");

                                log("MAIN", "DEBUG", `${this.getName()}: Farming with \"${this.getFarmingWindows().length}\" windows`);

                                this.timerAction("start");

                                this.updateStatus("farming");
                                resolve(undefined);
                            });

                    } else {
                        log("MAIN", "DEBUG", `${this.getName()}: No livestream found, no need to farm`);
                        this.updateStatus("idle");

                        resolve(undefined);
                    }
                }
            } catch (err) {
                reject(err);
            }
        })
    }
}