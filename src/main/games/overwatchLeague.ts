import { getPage } from "puppeteer-in-electron";
import { log } from "../logger";
import { getBrowserConnection } from "../puppeteer";
import FarmTemplate from "./farmTemplate";

export default class OverwatchLeague extends FarmTemplate {

    constructor() {
        super(
            "overwatch-league",
            "https://overwatchleague.com/en-us"
        );
    }

    /**
     * Press play on the farming window to start farming.
     *
     * @param {Electron.BrowserWindow} farmingWindow The farming window to press
     * play on.
     * @param {number} scrollY The Y-scroll position.
     */
    pressPlay(farmingWindow: Electron.BrowserWindow, scrollY: number) {
        return new Promise(async (resolve, reject) => {
            try {
                let page = await getPage(getBrowserConnection(), farmingWindow);

                await page.waitForNetworkIdle();

                /**
                 * Scroll to the video element.
                 */
                await page.evaluate(`window.scrollTo(0, ${scrollY})`);

                /**
                 * Enter the iframe element and play the video.
                 */
                page.waitForSelector("iframe")
                    .then(async (iframeHandle) => {
                        await page.waitForNetworkIdle();
                        return await iframeHandle!.contentFrame();
                    })
                    .then(async (frame) => {
                        await page.waitForNetworkIdle();
                        return frame;
                    })
                    .then(async (frame) => {
                        /**
                         * Double click to make sure the video is playing.
                         */
                        await frame!.click("button.ytp-large-play-button");
                        if (await page.$("button.ytp-play-button") != null)
                            await frame!.click("button.ytp-large-play-button");

                        log("MAIN", "INFO", `${this.getName()}: Pressed play on stream`);
                        resolve(undefined);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Check if the farming window is still live/farming.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    windowsStillFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                if (this.getFarmingWindows().length === 0) {
                    log("MAIN", "INFO", `${this.getName()}: No farming windows, skipping checking step`);
                    resolve(undefined);
                } else {
                    let page = await getPage(getBrowserConnection(), this.getFarmingWindow(0).window);

                    /**
                     * Check for *LIVE NOW* element.
                     */
                    if (await page.$("#__next > div > div > div.video-playerstyles__Container-sc-14q9if3-0.jycAff > div.video-playerstyles__VideoContainer-sc-14q9if3-5.bljChJ > div.video-playerstyles__HeadlineContainer-sc-14q9if3-3.eCpkgp > div.video-playerstyles__LiveIndicator-sc-14q9if3-7.bIaPsr > div") !== null) {
                        log("MAIN", "INFO", `${this.getName()}: Stream still live, continue farming`);
                        resolve(undefined);
                    } else {
                        this.removeFarmingWindowFromArray(0);

                        log("MAIN", "INFO", `${this.getName()}: Stream not live anymore, stopping farming`);

                        resolve(undefined);
                    }
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Check if the user needs to login.
     * If yes, wait until user finished logging in.
     * If no, check if at main screen.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                log("MAIN", "INFO", `${this.getName()}: Login process started`);
                let page = await getPage(getBrowserConnection(), window);

                await page.waitForNetworkIdle();

                /**
                 * If sign in button under video has been found (user *not* logged in).
                 */
                if (await page.$("#__next > div > div > div.video-playerstyles__Container-sc-14q9if3-0.jycAff > div.video-playerstyles__VideoContainer-sc-14q9if3-5.bljChJ > div.video-loginstyles__Wrapper-sc-1ta207g-0.bMrUTC > div > div > a") !== null) {
                    /**
                     * Click the sign in button.
                     */
                    await page.click("#__next > div > div > div.video-playerstyles__Container-sc-14q9if3-0.jycAff > div.video-playerstyles__VideoContainer-sc-14q9if3-5.bljChJ > div.video-loginstyles__Wrapper-sc-1ta207g-0.bMrUTC > div > div > a");

                    /**
                     * Check if user has been moved to the login page.
                     */
                    try {
                        await page.waitForSelector("#accountName");

                        log("MAIN", "INFO", `${this.getName()}: Login is needed by user`);

                        /**
                         * Open checker window for user login.
                         */
                        window.show();
                        window.focus();

                        /**
                         * Wait until user is back at main page with video element.
                         */
                        page.waitForSelector("#__next > div > div > div.video-playerstyles__Container-sc-14q9if3-0.jycAff > div.video-playerstyles__VideoContainer-sc-14q9if3-5.bljChJ > div.video-playerstyles__HeadlineContainer-sc-14q9if3-3.eCpkgp", { timeout: 0 })
                            .then(() => {
                                log("MAIN", "INFO", `${this.getName()}: Login completed`);
                                window.hide();
                                resolve(undefined);
                            });
                    } catch (err) {
                        log("MAIN", "INFO", `${this.getName()}: Login completed`);
                        resolve(undefined);
                    }
                } else {
                    log("MAIN", "INFO", `${this.getName()}: User already logged in, continuing`);
                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Check for the *LIVE NOW* element and open the window as a farming window
     * and press play.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    startFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                let page = await getPage(getBrowserConnection(), window);

                /**
                 * Check if farming windows exist, if yes don't try to check for new stream.
                 */
                if (this.getFarmingWindows().length > 0) {
                    log("MAIN", "INFO", `${this.getName()}: Already farming, no need to start again`);

                    this.updateStatus("farming");
                    resolve(undefined);
                } else {
                    await page.waitForTimeout(2000);

                    /**
                     * Check for *LIVE NOW* element.
                     */
                    if (await page.$("#__next > div > div > div.video-playerstyles__Container-sc-14q9if3-0.jycAff > div.video-playerstyles__VideoContainer-sc-14q9if3-5.bljChJ > div.video-playerstyles__HeadlineContainer-sc-14q9if3-3.eCpkgp > div.video-playerstyles__LiveIndicator-sc-14q9if3-7.bIaPsr > div") !== null) {
                        this.createFarmingWindow(this.getCheckerWebsite())
                            .then(async (farmingWindow: Electron.BrowserWindow) => {
                                await this.pressPlay(farmingWindow, 200);

                                log("MAIN", "INFO", `${this.getName()}: Farming with \"${this.getFarmingWindows().length}\" windows`);

                                this.timerAction("start");

                                this.updateStatus("farming");
                                resolve(undefined);
                            });
                    } else if (await page.$("#__next > div > div > div.renderblocksstyles__DesktopBlock-sc-3odw2o-0.gpjAVR > a") !== null) {
                        let element = await page.$("#__next > div > div > div.renderblocksstyles__DesktopBlock-sc-3odw2o-0.gpjAVR > a");
                        let href: string = await (await element!.getProperty("href")).jsonValue();

                        if (href === this.getCheckerWebsite()) {
                            log("MAIN", "INFO", `${this.getName()}: Found banner, but game has not started yet.`)

                            this.updateStatus("idle");
                            resolve(undefined);
                        } else {
                            this.createFarmingWindow(this.getCheckerWebsite())
                                .then(async (farmingWindow: Electron.BrowserWindow) => {
                                    await this.pressPlay(farmingWindow, 1050);

                                    log("MAIN", "INFO", `${this.getName()}: Farming with \"${this.getFarmingWindows().length}\" windows`);

                                    this.timerAction("start");

                                    this.updateStatus("farming");
                                    resolve(undefined);
                                });
                        }
                    } else {
                        /**
                         * No live match right now.
                         * Set the status back to idle.
                         */
                        log("MAIN", "INFO", `${this.getName()}: No live matches available, returning status back to idle`);
                        this.updateStatus("idle");

                        resolve(undefined);
                    }
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}