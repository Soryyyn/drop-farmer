import { getPage } from "puppeteer-in-electron";
import { log } from "../logger";
import { getBrowserConnection } from "../puppeteer";
import { createFarmWindow, destroyWindow } from "../windows";
import { GameFarmTemplate } from "./gameFarmTemplate";

/**
 * Overwatch Contenders farm.
 */
export class OverwatchContenders extends GameFarmTemplate {
    gameName: string = "overwatch-contenders";
    checkerWebsite: string = "https://overwatchleague.com/en-us/contenders";
    schedule: number = 30;

    constructor() {
        super();
    }

    /**
     * Press play on the farming window to start farming.
     *
     * @param window The farming window to press play on.
     */
    pressPlay(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

            /**
             * Scroll to the video element.
             */
            await page.evaluate("window.scrollTo(0, 1050)");

            /**
             * Enter the iframe element and play the video.
             */
            page.waitForSelector("iframe")
                .then(async (iframeHandle) => {
                    return await iframeHandle!.contentFrame();
                })
                .then(async (frame) => {
                    await frame!.waitForTimeout(2000);
                    await frame!.click("button.ytp-large-play-button");

                    resolve(undefined);
                });
        });
    }

    /**
     * Check if the user needs to login.
     * If yes, wait until user finished logging in.
     * If no, check if at main screen.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    login(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            log("MAIN", "INFO", `\"${this.gameName}\": Login process started`);
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

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

                    log("MAIN", "INFO", `\"${this.gameName}\": Login is needed by user`);

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
                            log("MAIN", "INFO", `\"${this.gameName}\": Login completed`);
                            window.hide();
                            resolve(undefined);
                        });
                } catch (err) {
                    log("MAIN", "INFO", `\"${this.gameName}\": Login completed`);
                    resolve(undefined);
                }
            } else {
                log("MAIN", "INFO", `\"${this.gameName}\": User already logged in, continuing`);
                resolve(undefined);
            }
        });
    }

    /**
     * Check if the farming window is still live/farming.
     */
    windowsStillFarming() {
        return new Promise(async (resolve, reject) => {
            if (this.farmingWindows.length === 0) {
                log("MAIN", "INFO", `\"${this.gameName}\": No farming windows, skipping checking step`);
                resolve(undefined);
            } else {
                let connection = getBrowserConnection();
                let page = await getPage(connection, this.farmingWindows[0]);

                /**
                 * Check for *LIVE NOW* element.
                 */
                if (await page.$("#__next > div > div > div.video-playerstyles__Container-sc-14q9if3-0.jycAff > div.video-playerstyles__VideoContainer-sc-14q9if3-5.bljChJ > div.video-playerstyles__HeadlineContainer-sc-14q9if3-3.eCpkgp > div.video-playerstyles__LiveIndicator-sc-14q9if3-7.bIaPsr > div") !== null) {
                    log("MAIN", "INFO", `\"${this.gameName}\": Stream still live, continue farming`);
                    resolve(undefined);
                } else {
                    /**
                     * Destroy the farming window.
                     */
                    destroyWindow(this.farmingWindows[0]);
                    this.farmingWindows.splice(0, 1);

                    log("MAIN", "INFO", `\"${this.gameName}\": Stream not live anymore, stopping farming`);

                    resolve(undefined);
                }
            }
        });
    }

    /**
     * Check for the *LIVE NOW* element and open the window as a farming window
     * and press play.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    startFarming(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

            /**
             * Check if farming windows exist, if yes don't try to check for new stream.
             */
            if (this.farmingWindows.length > 0) {
                log("MAIN", "INFO", `\"${this.gameName}\": Already farming, no need to start again`);

                this.changeStatus("farming");
                resolve(undefined);
            } else {
                await page.waitForTimeout(2000);

                /**
                 * Check for *LIVE NOW* element.
                 */
                if (await page.$("#__next > div > div > div.video-playerstyles__Container-sc-14q9if3-0.jycAff > div.video-playerstyles__VideoContainer-sc-14q9if3-5.bljChJ > div.video-playerstyles__HeadlineContainer-sc-14q9if3-3.eCpkgp > div.video-playerstyles__LiveIndicator-sc-14q9if3-7.bIaPsr > div") !== null) {
                    let window = await createFarmWindow(this.checkerWebsite, this.gameName);
                    this.farmingWindows.push(window);

                    await this.pressPlay(this.farmingWindows[0]);

                    log("MAIN", "INFO", `\"${this.gameName}\": Farming with \"${this.farmingWindows.length}\" windows`);

                    /**
                     * Start the uptime timer if not running.
                     * If already running, resume.
                     */
                    if (this.timer.isPaused()) {
                        this.timer.resume();
                        log("MAIN", "INFO", `\"${this.gameName}\": Resumed timer`);
                    } else if (!this.timer.isStarted()) {
                        this.timer.start();
                        log("MAIN", "INFO", `\"${this.gameName}\": Started timer`);
                    }

                    this.changeStatus("farming");
                    resolve(undefined);
                } else {
                    /**
                     * No live match right now.
                     * Set the status back to idle.
                     */
                    log("MAIN", "INFO", `\"${this.gameName}\": No live matches available, returning status back to idle`);
                    this.changeStatus("idle");

                    resolve(undefined);
                }
            }
        });
    }

    /**
     * Check the overwatch-contenders farm.
     */
    farmCheck(): void {
        if (this.status !== "checking") {
            log("MAIN", "INFO", `\"${this.gameName}\": Started checking the farm`);
            this.changeStatus("checking");

            /**
             * Pause the timer while checking.
             */
            if (this.timer.isRunning()) {
                this.timer.pause();
                this.uptime += this.timer.ms();
                log("MAIN", "INFO", `\"${this.gameName}\": Paused timer`);
            }

            /**
             * Create the checker window.
             */
            this.createFarmCheckingWindow()
                .then(async () => {
                    await this.login(this.checkerWindow!);
                })
                .then(async () => {
                    await this.windowsStillFarming();
                })
                .then(async () => {
                    await this.startFarming(this.checkerWindow!);
                })
                .then(() => {
                    /**
                     * Destroy the checker window and remove the reference.
                     */
                    destroyWindow(this.checkerWindow!);
                    this.checkerWindow = null;

                    log("MAIN", "INFO", `\"${this.gameName}\": Destroyed checker window`);
                })
                .then(() => {
                    /**
                     * Destroy the windows if the status has been set to disabled.
                     */
                    if (!this.getEnabled()) {
                        log("MAIN", "INFO", `\"${this.gameName}\": Destroying all windows because farm has been disabled`);
                        if (this.checkerWindow !== null) {
                            destroyWindow(this.checkerWindow);
                            this.checkerWindow = null;
                        }

                        for (const farmWindow of this.farmingWindows) {
                            destroyWindow(farmWindow);
                            this.farmingWindows = [];
                        }

                        this.changeStatus("disabled");
                    }
                })
                .catch((err) => {
                    log("MAIN", "ERROR", `\"${this.gameName}\": Error occurred while checking the farm. ${err}`);
                    this.changeStatus("attention-required");
                });
        }
    }
}