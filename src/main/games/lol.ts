import { takeHeapSnapshot } from "process";
import { ElementHandle } from "puppeteer-core";
import { getPage } from "puppeteer-in-electron";
import { log } from "../logger";
import { getBrowserConnection } from "../puppeteer";
import { createFarmWindow, destroyWindow, reloadWindow } from "../windows";
import { GameFarmTemplate } from "./gameFarmTemplate";

/**
 * League of Legends game farm.
 */
export class LOL extends GameFarmTemplate {
    constructor() {
        super();
    }

    /**
     * Get the current live matches from the schedule route.
     *
     * @param {Electron.BrowserWindow} window The checker window to get the
     * matches from
     */
    getCurrentLiveMatches(window: Electron.BrowserWindow) {
        return new Promise(async (resolve: (urls: string[]) => void) => {
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

            /**
             * Get all elements with with the specified classes; Get live livestreams.
             */
            let liveMatchesElements = await page.$$("a.live.event");

            /**
             * Check if there are live matches available.
             */
            if (liveMatchesElements.length > 0) {
                const hrefs: string[] = [];

                /**
                 * Get all href properties from the elements.
                 */
                for (const element of liveMatchesElements) {
                    hrefs.push(await (await element.getProperty("href")).jsonValue());
                }

                log("MAIN", "INFO", `\"${this.gameName}\": Got current live matches`)
                resolve(hrefs);
            } else {
                /**
                 * Resolve with empty array if there are no live matches.
                 */
                log("MAIN", "INFO", `\"${this.gameName}\": Not live matches found`)
                resolve([]);
            }
        });
    }

    /**
     * Check if the current farming windows are still live.
     *
     * @param {Electron.BrowserWindow} window The checker window to control.
     */
    windowsStillFarming(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            /**
             * If an error occurs in any step, reject the promise.
             */
            try {
                /**
                 * Check if there are farming windows or if it needs to skip.
                 */
                if (this.farmingWindows.length === 0) {
                    log("MAIN", "INFO", `\"${this.gameName}\": No farming windows, skipping checking step`);
                    resolve(undefined);
                } else {
                    log("MAIN", "INFO", `\"${this.gameName}\": Farming windows found, checking if still live`);

                    /**
                     * Get the current live matches.
                     */
                    const currentLiveMatches = await this.getCurrentLiveMatches(window)

                    /**
                     * The amount of windows destroyed.
                     */
                    let destroyedAmount: number = 0;

                    /**
                     * Go through each farming window and check if all farming
                     * window urls have an entry in the current live matches.
                     * If it is not found, then destroy the farming window.
                     */
                    for (const farmWindow of this.farmingWindows) {

                        /**
                         * If the match has been found in the farming window.
                         */
                        let found: boolean = false

                        for (const liveMatch of currentLiveMatches) {
                            /**
                             * URL of current farm window.
                             */
                            let url: string = farmWindow.webContents.getURL();

                            if (url.includes(liveMatch)) {
                                found = true;
                            }
                        }

                        /**
                         * If no window with the url has been found.
                         */
                        if (!found) {
                            /**
                             * Get the index of the window.
                             */
                            let index = this.farmingWindows.indexOf(farmWindow);

                            /**
                             * Destroy the farming window.
                             */
                            destroyWindow(this.farmingWindows[index]);
                            this.farmingWindows.splice(index, 1);

                            destroyedAmount++;
                        }
                    }

                    log("MAIN", "INFO", `\"${this.gameName}\": Destroyed ${destroyedAmount} windows`);
                    resolve(undefined);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Create the checker window and login.
     * Check the lol schedule after loging in.
     */
    login(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            log("MAIN", "INFO", `\"${this.gameName}\": Login process started`);
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

            /**
             * If an error occurs in any step, reject the promise.
             */
            try {
                /**
                * Check if the checker window is already logged in.
                */
                if (await page.$("div.riotbar-summoner-name") === null) {
                    /**
                     * Click the "login" button on the top right.
                     */
                    await page.click("#riotbar-right-content > div.undefined.riotbar-account-reset._2f9sdDMZUGg63xLkFmv-9O.riotbar-account-container > div > a");

                    /**
                     * Check if user has been moved to login or home route.
                     */
                    try {
                        await page.waitForSelector("body > div:nth-child(3) > div > div > div.grid.grid-direction__row.grid-page-web__content > div > div > div.grid.grid-align-center.grid-justify-space-between.grid-fill.grid-direction__column.grid-panel-web__content.grid-panel__content > div > div > div > div:nth-child(1) > div > input");

                        log("MAIN", "INFO", `\"${this.gameName}\": Login is needed by user`);

                        /**
                         * Open checker window for user login.
                         */
                        window.show();
                        window.focus();

                        /**
                         * Back at main page.
                         */
                        page.waitForSelector("div.riotbar-summoner-name", { timeout: 0 })
                            .then(() => {
                                log("MAIN", "INFO", `\"${this.gameName}\": Login completed`);
                                window.hide();
                                resolve(undefined);
                            });
                    } catch (e) {
                        log("MAIN", "INFO", `\"${this.gameName}\": Login completed`);
                        resolve(undefined);
                    }
                } else {
                    log("MAIN", "INFO", `\"${this.gameName}\": User already logged in, continuing`);
                    resolve(undefined);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Move the checker window url to the schedule route.
     */
    moveToScheduleRoute(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

            /**
             * If an error occurs in any step, reject the promise.
             */
            try {
                /**
                 * Schedule urls with all wanted farms.
                 */
                let scheduleUrl: string = "https://lolesports.com/schedule?leagues=lec,european-masters,primeleague,cblol-brazil,lck,lcl,lco,lcs,ljl-japan,lla,lpl,pcs,turkiye-sampiyonluk-ligi,worlds,all-star,cblol_academy,college_championship,esports_balkan_league,elite_series,greek_legends,hitpoint_masters,lck_academy,lck_challengers_league,lcs-academy,proving_grounds,lfl,liga_portuguesa,nlc,pg_nationals,superliga,ultraliga,lcs_amateur,msi";

                /**
                 * Move to the schedule url.
                 */
                await page.goto(scheduleUrl);

                /**
                 * Wait until moving is finished.
                 */
                page.waitForSelector("div.events", { timeout: 0 })
                    .then(() => {
                        log("MAIN", "INFO", `\"${this.gameName}\": Moved window to schedule`);
                        resolve(undefined);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get all live matches from the schedule and start farming.
     *
     * @param {Electron.BrowserWindow} window The window to control
     */
    startFarming(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {

            /**
             * If an error occurs in any step, reject the promise.
             */
            try {
                /**
                 * The livestream urls to check, if the original href should
                 * redirect to one of these.
                 */
                const livestreamRedirects: string[] = [
                    "https://lolesports.com/live/lpl/lpl",
                    "https://lolesports.com/live/lck/lck",
                    "https://lolesports.com/live/lec/lec",
                    "https://lolesports.com/live/lcs/lcs",
                    "https://lolesports.com/live/lco/lco",
                    "https://lolesports.com/live/cblol/cblol",
                    "https://lolesports.com/live/lla/lla",
                    "https://lolesports.com/live/lck_challengers_league/lckcl",
                    "https://lolesports.com/live/cblol_academy/cblol",
                ];

                /**
                 * The current live matches urls.
                 */
                const currentLiveMatches: string[] = await this.getCurrentLiveMatches(window);

                if (currentLiveMatches.length > 0) {
                    /**
                     * All hrefs with checking for duplicates.
                     */
                    let hrefs: string[] = [];

                    /**
                     * Go through each url and redirect it to the correct one.
                     */
                    for (const liveMatch of currentLiveMatches) {
                        let href: string = liveMatch;

                        /**
                         * Redirect if same link found.
                         */
                        livestreamRedirects.forEach((redirectUrl: string) => {
                            if (redirectUrl.includes(liveMatch)) {
                                href = redirectUrl;
                            }
                        });

                        /**
                         * Check if the window needs to be created or if it already
                         * exists and is currently farming.
                         */
                        if (this.farmingWindows.length > 0) {
                            let duplicate = false;

                            for (let i = 0; i < this.farmingWindows.length; i++) {
                                if (this.farmingWindows[i].webContents.getURL().includes(href) || this.farmingWindows[i].webContents.getURL() === href) {
                                    duplicate = true;
                                }
                            }

                            if (!duplicate)
                                hrefs.push(href);
                        } else {
                            hrefs.push(href);
                        }
                    }

                    /**
                     * Create the farm windows for all hrefs.
                     */
                    for (const href of hrefs) {
                        let window = await createFarmWindow(href, this.gameName);
                        this.farmingWindows.push(window);
                    }

                    /**
                     * Clear hrefs array.
                     */
                    hrefs = [];

                    /**
                     * Change status to farming.
                     */
                    log("MAIN", "INFO", `\"${this.gameName}\": Farming with \"${this.farmingWindows.length}\" windows`);

                    /**
                     * Start the uptime timer if not running.
                     * If already running, resume.
                     */
                    if (this.timer.isPaused()) {
                        this.timer.resume();
                        log("MAIN", "INFO", `\"${this.gameName}\": Resumed timer`);
                    }
                    else if (!this.timer.isStarted()) {
                        this.timer.start();
                        log("MAIN", "INFO", `\"${this.gameName}\": Started timer`);
                    }

                    this.changeStatus("farming");
                    resolve(undefined);
                } else {
                    /**
                     * No live matches available.
                     * Set app farm status back to idle.
                     */
                    log("MAIN", "INFO", `\"${this.gameName}\": No live matches available, returning status back to idle`);
                    this.changeStatus("idle");

                    resolve(undefined);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Check the farm for lol.
     */
    async farmCheck() {
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
                    await this.moveToScheduleRoute(this.checkerWindow!);
                })
                .then(async () => {
                    await this.windowsStillFarming(this.checkerWindow!);
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
                .catch((err) => {
                    log("MAIN", "ERROR", `\"${this.gameName}\": Error occurred while checking the farm. ${err}`);
                    this.changeStatus("attention-required");
                });
        }
    }
}