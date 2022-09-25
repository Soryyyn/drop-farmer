import { ElementHandle } from "puppeteer-core";
import { getPage } from "puppeteer-in-electron";
import { log } from "../util/logger";
import { getBrowserConnection } from "../util/puppeteer";
import FarmTemplate from "./template";

export default class LeagueOfLegends extends FarmTemplate {

    constructor() {
        super(
            "league-of-legends",
            "https://lolesports.com/"
        );
    }

    /**
     * Get the current live matches from the schedule route.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    getCurrentLiveMatches(window: Electron.BrowserWindow): Promise<string[]> {
        return new Promise<string[]>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);

                /**
                 * Move to schedule route.
                 */
                await page.goto("https://lolesports.com/schedule?leagues=lec,european-masters,primeleague,cblol-brazil,lck,lcl,lco,lcs,ljl-japan,lla,lpl,pcs,turkiye-sampiyonluk-ligi,worlds,all-star,cblol_academy,college_championship,esports_balkan_league,elite_series,greek_legends,hitpoint_masters,lck_academy,lck_challengers_league,lcs-academy,proving_grounds,lfl,liga_portuguesa,nlc,pg_nationals,superliga,ultraliga,lcs_amateur,msi");

                /**
                 * Wait until the events are found.
                 */
                await page.waitForSelector("div.events", { timeout: 0 });

                /**
                 * Get all elements from the schedule.
                 */
                const matchElements: ElementHandle<any>[] = await page.$$("a.live.event");

                /**
                 * If there are no matches return an empty array.
                 */
                if (matchElements.length > 0) {
                    const hrefs: string[] = [];

                    /**
                     * Get href properties from the elements.
                     */
                    for (const element of matchElements)
                        hrefs.push(await (await element.getProperty("href")).jsonValue());

                    log("MAIN", "DEBUG", `${this.getName()}: Got ${hrefs.length} matches`);
                    resolve(hrefs);
                } else {
                    log("MAIN", "DEBUG", `${this.getName()}: No matches found`);
                    resolve([]);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Check if the current farming windows can be closed or not.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    windowsStillFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                /**
                 * Skip this step if there are no farming windows available.
                 */
                if (this.getFarmingWindows().length === 0) {
                    log("MAIN", "DEBUG", `${this.getName()}: No farming windows, skipping checking step`);
                    resolve(undefined);
                } else {
                    log("MAIN", "DEBUG", `${this.getName()}: Checking if farming windows can be closed`);

                    const currentLiveMatches: string[] = await this.getCurrentLiveMatches(window);
                    let destroyedWindowsAmount: number = 0;

                    /**
                     * Go through each farming window and check if all farming
                     * window urls have an entry in the current live matches.
                     * If it is not found, then destroy the farming window.
                     */
                    for (const farmingWindow of this.getFarmingWindows()) {
                        let found: boolean = false;

                        /**
                         * Get the url of the farming windows.
                         */
                        for (const liveMatch of currentLiveMatches) {
                            const url: string = farmingWindow.window.webContents.getURL();

                            if (url.includes(liveMatch))
                                found = true;
                        }

                        /**
                         * If the farming window is not in the current live matches
                         * array, destroy the window.
                         */
                        if (!found) {
                            this.removeFarmingWindowFromArray(farmingWindow);
                            destroyedWindowsAmount++;
                        }
                    }

                    if (destroyedWindowsAmount > 0)
                        log("MAIN", "DEBUG", `${this.getName()}: No farming windows destroyed`);
                    else
                        log("MAIN", "DEBUG", `${this.getName()}: Destroyed ${destroyedWindowsAmount} farming windows`);

                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Login the user into the farm.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);

                /**
                 * Check if already logged in.
                 */
                if (await page.$("div.riotbar-summoner-name") === null) {
                    /**
                     * Click the "login" button on the top right.
                     */
                    await page.click("#riotbar-right-content > div.undefined.riotbar-account-reset._2f9sdDMZUGg63xLkFmv-9O.riotbar-account-container > div > a");

                    /**
                     * Wait for either the user has been redirected to the main page
                     * logged in *or* redirected to the login page.
                     */
                    const finishedSelector = await (Promise.race([
                        page.waitForSelector("div.riotbar-summoner-name"),
                        page.waitForSelector("body > div:nth-child(3) > div > div > div.grid.grid-direction__row.grid-page-web__content > div > div > div.grid.grid-align-center.grid-justify-space-between.grid-fill.grid-direction__column.grid-panel-web__content.grid-panel__content > div > div > div > div:nth-child(1) > div > input")
                    ]));

                    /**
                     * Returns either `DIV` if at home route or `INPUT` if at login.
                     */
                    const element = await page.evaluate(element => element!.tagName, finishedSelector);

                    if (element === "DIV") {
                        log("MAIN", "DEBUG", `${this.getName()}: Login completed`);
                        resolve(undefined);
                    } else if (element === "INPUT") {
                        log("MAIN", "DEBUG", `${this.getName()}: Login is needed by user`);

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
                                log("MAIN", "DEBUG", `${this.getName()}: Login completed`);
                                window.hide();
                                resolve(undefined);
                            });
                    }
                } else {
                    log("MAIN", "DEBUG", `${this.getName()}: User already logged in, continuing`);
                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Get all live matches from the schedule and start farming.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    startFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
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
                         * Check if the window needs to be created or if it already
                         * exists and is currently farming.
                         */
                        if (this.getFarmingWindows().length > 0) {
                            let duplicate = false;

                            for (let i = 0; i < this.getFarmingWindows().length; i++) {
                                if (this.getFarmingWindow(i).window.webContents.getURL().includes(href) || this.getFarmingWindow(i).window.webContents.getURL() === href) {
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
                        this.createFarmingWindow(href);
                    }

                    /**
                     * Clear hrefs array.
                     */
                    hrefs = [];

                    /**
                     * Change status to farming.
                     */
                    log("MAIN", "DEBUG", `${this.getName()}: Farming with \"${this.getFarmingWindows().length}\" windows`);

                    this.timerAction("start");

                    this.updateStatus("farming");
                    resolve(undefined);
                } else {
                    /**
                     * No live matches available.
                     * Set app farm status back to idle.
                     */
                    log("MAIN", "DEBUG", `${this.getName()}: No live matches available, returning status back to idle`);
                    this.updateStatus("idle");

                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

}