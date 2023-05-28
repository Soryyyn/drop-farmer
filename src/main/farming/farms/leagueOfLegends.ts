import { sendOneWay } from '@main/electron/ipc';
import { EventChannels, IpcChannels } from '@main/util/constants';
import { emitEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    doesElementExist,
    getBrowserConnection,
    getElementProperty,
    gotoURL,
    pageUrlContains,
    waitForElementToAppear,
    waitForTimeout
} from '@main/util/puppeteer';
import { ElementHandle } from 'puppeteer-core';
import { getPage } from 'puppeteer-in-electron';
import FarmTemplate from '../template';

export default class LeagueOfLegends extends FarmTemplate {
    constructor() {
        super('League Of Legends', 'https://lolesports.com/');
    }

    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            let wasLoginNeeded = false;

            try {
                const page = await getPage(getBrowserConnection(), window);

                const headerElement = 'div.riotbar-header';
                await waitForElementToAppear(page, headerElement);

                /**
                 * Check if already logged in.
                 */
                if (
                    !(await doesElementExist(page, 'div.riotbar-summoner-name'))
                ) {
                    /**
                     * Click the "login" button on the top right.
                     */
                    await page.click(
                        'div.riotbar-account-anonymous-link-wrapper'
                    );

                    await waitForTimeout(3000);

                    /**
                     * Wait for either the user has been redirected to the main page
                     * logged in *or* redirected to the login page.
                     */
                    await Promise.race([
                        waitForElementToAppear(
                            page,
                            'div.riotbar-summoner-name',
                            0
                        ),
                        waitForElementToAppear(
                            page,
                            'div.auth-rso-login-page',
                            0
                        )
                    ]);

                    if (
                        await pageUrlContains(
                            page,
                            'https://auth.riotgames.com/'
                        )
                    ) {
                        log('info', `${this.id}: Login is needed by user`);
                        wasLoginNeeded = true;

                        emitEvent(EventChannels.LoginForFarm, {
                            id: this.id,
                            needed: true
                        });

                        if (
                            this.windowsCurrentlyShown ||
                            this.windowsShownByDefault
                        ) {
                            window.show();
                            window.focus();
                        }

                        /**
                         * Back at main page.
                         */
                        await waitForElementToAppear(page, 'main.Home', 0);
                    } else {
                        log('info', `${this.id}: Login completed`);
                    }
                } else {
                    log('info', `${this.id}: Already logged in`);
                }

                if (wasLoginNeeded) {
                    sendOneWay(IpcChannels.farmLogin, {
                        id: this.id,
                        needed: false
                    });
                }

                resolve(undefined);
            } catch (err) {
                reject(err);
            }
        });
    }

    getCurrentLiveMatches(window: Electron.BrowserWindow): Promise<string[]> {
        return new Promise<string[]>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);

                /**
                 * Move to schedule route.
                 */
                await gotoURL(page, 'https://lolesports.com/schedule');

                /**
                 * Wait until the events are found.
                 */
                await waitForElementToAppear(page, 'main.Schedule');

                /**
                 * Select all unselected leagues.
                 */
                await page.$$eval(
                    'div.leagues > button.button.league:not(.selected) > div.info',
                    (leagues: any) =>
                        leagues.forEach((league: HTMLDivElement) =>
                            league.click()
                        )
                );

                await waitForTimeout(3000);

                /**
                 * Get all elements from the schedule.
                 */
                const matchElements: ElementHandle<any>[] = await page.$$(
                    'a.live.event'
                );

                /**
                 * If there are no matches return an empty array.
                 */
                if (matchElements.length > 0) {
                    const hrefs: string[] = [];

                    /**
                     * Get href properties from the elements.
                     */
                    for (const element of matchElements)
                        hrefs.push(await getElementProperty(element, 'href'));

                    log('info', `${this.id}: Got ${hrefs.length} matches`);
                    resolve(hrefs);
                } else {
                    log('info', `${this.id}: No matches found`);
                    resolve([]);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    stillFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                /**
                 * Skip this step if there are no farming windows available.
                 */
                if (this.farmers.length === 0) {
                    log(
                        'info',
                        `${this.id}: No farming windows, skipping checking step`
                    );
                    resolve(undefined);
                } else {
                    log(
                        'info',
                        `${this.id}: Checking if farming windows can be closed`
                    );

                    const currentLiveMatches: string[] =
                        await this.getCurrentLiveMatches(window);
                    let destroyedWindowsAmount: number = 0;

                    /**
                     * Go through each farming window and check if all farming
                     * window urls have an entry in the current live matches.
                     * If it is not found, then destroy the farming window.
                     */
                    this.farmers.forEach(async (farmingWindow) => {
                        let found: boolean = false;

                        /**
                         * Get the url of the farming windows.
                         */
                        for (const liveMatch of currentLiveMatches) {
                            const url: string =
                                farmingWindow.webContents.getURL();
                            if (url.includes(liveMatch)) found = true;
                        }

                        /**
                         * If the farming window is not in the current live matches
                         * array, destroy the window.
                         */
                        if (!found) {
                            this.destroyWindowFromArray(
                                this.farmers,
                                farmingWindow
                            );
                            destroyedWindowsAmount++;
                        }
                    });

                    if (destroyedWindowsAmount > 0)
                        log('info', `${this.id}: No farming windows destroyed`);
                    else
                        log(
                            'info',
                            `${this.id}: Destroyed ${destroyedWindowsAmount} farming windows`
                        );

                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    startFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                /**
                 * The current live matches urls.
                 */
                const currentLiveMatches: string[] =
                    await this.getCurrentLiveMatches(window);

                if (currentLiveMatches.length > 0) {
                    /**
                     * All hrefs with checking for duplicates.
                     */
                    const hrefs: string[] = [];

                    /**
                     * Go through each url and redirect it to the correct one.
                     */
                    for (const liveMatch of currentLiveMatches) {
                        const href: string = liveMatch;

                        /**
                         * Check if the window needs to be created or if it already
                         * exists and is currently farming.
                         */
                        if (this.farmers.length > 0) {
                            let duplicate = false;

                            for (let i = 0; i < this.farmers.length; i++) {
                                if (
                                    this.farmers[i].webContents
                                        .getURL()
                                        .includes(href) ||
                                    this.farmers[i].webContents.getURL() ===
                                        href
                                ) {
                                    duplicate = true;
                                }
                            }

                            if (!duplicate) hrefs.push(href);
                        } else {
                            hrefs.push(href);
                        }
                    }

                    /**
                     * Create the farm windows for all hrefs.
                     */
                    hrefs.forEach(async (href) => {
                        await this.createArrayWindow(href, this.farmers);
                    });

                    await waitForTimeout(2000);

                    /**
                     * Change status to farming.
                     */
                    log(
                        'info',
                        `${this.id}: Farming with "${this.farmers.length}" windows`
                    );

                    resolve(undefined);
                } else {
                    /**
                     * No live matches available.
                     * Set app farm status back to idle.
                     */
                    log(
                        'info',
                        `${this.id}: No live matches available, returning status back to idle`
                    );

                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    setLowestQualityPossible(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                for await (const window of this.farmers) {
                    const page = await getPage(getBrowserConnection(), window);

                    /**
                     * Go to the embedded twitch player site to set the localstorage key.
                     */
                    await gotoURL(page, 'https://player.twitch.tv/');

                    /**
                     * Set the default quality in the localstorage.
                     */
                    await page.evaluate(() => {
                        localStorage.setItem(
                            'video-quality',
                            '{"default":"160p30"}'
                        );
                    });

                    /**
                     * Go back to the stream site and reload the site.
                     */
                    await page.goBack();
                    await page.reload();
                }

                log(
                    'info',
                    `${this.id}: Set to lowest resolution possible on all windows`
                );
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}
