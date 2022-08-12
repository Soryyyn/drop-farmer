import { getPage } from "puppeteer-in-electron";
import { log } from "../logger";
import { getBrowserConnection } from "../puppeteer";
import { createFarmWindow, destroyWindow } from "../windows";
import { GameFarmTemplate } from "./gameFarmTemplate";

/**
 * League of Legends game farm.
 */
export class LOL extends GameFarmTemplate {
    constructor() {
        super(
            "league-of-legends",
            true,
            "https://lolesports.com/"
        );
    }

    /**
     * Create the checker window and login.
     * Check the lol schedule after loging in.
     */
    login(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            log("INFO", `Took control of page for farm \"${this.gameName}\" and started login process `);
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

            /**
             * Check if the checker window is already logged in.
             */
            if (await page.$("div.riotbar-summoner-name") === null) {
                /**
                 * Click the "login" button on the top right.
                 */
                await page.click('#riotbar-right-content > div.undefined.riotbar-account-reset._2f9sdDMZUGg63xLkFmv-9O.riotbar-account-container > div > a');

                /**
                 * Check if user has been moved to login or home route.
                 */
                try {
                    await page.waitForSelector("body > div:nth-child(3) > div > div > div.grid.grid-direction__row.grid-page-web__content > div > div > div.grid.grid-align-center.grid-justify-space-between.grid-fill.grid-direction__column.grid-panel-web__content.grid-panel__content > div > div > div > div:nth-child(1) > div > input");

                    log("INFO", `Login is needed by user for game \"${this.gameName}\"`);

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
                            log("INFO", "Login complete");
                            window.hide();
                            resolve(undefined);
                        });
                } catch (e) {
                    log("INFO", "Login complete");
                    resolve(undefined);
                }
            } else {
                log("INFO", "User already logged in; continuing");
                resolve(undefined);
            }
        });
    }

    /**
     * Move the checker window url to the schedule route.
     */
    moveToScheduleRoute(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            log("INFO", `Took control of page for farm \"${this.gameName}\" and moving it to schedule route`);
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

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
                    log("INFO", "Moved checker window to schedule url");
                    resolve(undefined);
                });
        });
    }

    /**
     * Get all live matches from the schedule and start farming.
     *
     * @param {Electron.BrowserWindow} window The window to control
     */
    startFarming(window: Electron.BrowserWindow) {
        return new Promise(async (resolve, reject) => {
            log("INFO", `Took control of page for farm \"${this.gameName}\" and moving it to schedule route`);
            let connection = getBrowserConnection();
            let page = await getPage(connection, window);

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
             * Get all elements with with the specified classes; Get live livestreams.
             */
            let liveMatchesElements = await page.$$("a.live.event");

            /**
             * Check if there are live matches available.
             */
            if (liveMatchesElements.length > 0) {
                /**
                 * All hrefs with checking for duplicates.
                 */
                let hrefs: string[] = [];

                /**
                 * Go through each element and get the href url.
                 */
                for (const element of liveMatchesElements) {
                    let propertyHandle = await element.getProperty("href");
                    let href: string = await propertyHandle.jsonValue();

                    /**
                     * Go through each href and check if redirect is needed.
                     */
                    livestreamRedirects.forEach((redirectUrl: string) => {
                        if (redirectUrl.includes(href)) {
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
                            if (!this.farmingWindows[i].webContents.getURL().includes(href)) {
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
                log("INFO", `Now farming for farm \"${this.gameName}\" with \"${this.farmingWindows.length}\" windows`);

                this.changeStatus("farming");
                resolve(undefined);
            } else {
                /**
                 * No live matches available.
                 * Set app farm status back to idle.
                 */
                log("INFO", `No live matches available; returning back to idle`);
                this.changeStatus("idle");

                resolve(undefined);
            }
        });
    }

    /**
     * Check the farm for lol.
     */
    farmCheck() {
        if (this.status !== "checking") {
            log("INFO", `Started checking the farm \"${this.gameName}\"`);
            this.changeStatus("checking");

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
                    await this.startFarming(this.checkerWindow!);
                })
                .then(() => {
                    /**
                     * Destroy the checker window and remove the reference.
                     */
                    destroyWindow(this.checkerWindow!);
                    this.checkerWindow = null;

                    log("WARN", "Destroyed checker window");
                });
        }
    }

}