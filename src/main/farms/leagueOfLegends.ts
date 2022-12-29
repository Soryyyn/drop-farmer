import { ElementHandle } from 'puppeteer-core';
import { getPage } from 'puppeteer-in-electron';
import { EventChannels, IpcChannels } from '../common/constants';
import { sendOneWay } from '../electron/ipc';
import { getMainWindow } from '../electron/windows';
import { emitEvent } from '../util/events';
import { log } from '../util/logger';
import { createNotification } from '../util/notifications';
import {
    connectToElectron,
    doesElementExist,
    getBrowserConnection,
    getElementTagName,
    waitForElementToAppear,
    waitForTimeout
} from '../util/puppeteer';
import FarmTemplate from './template';

export default class LeagueOfLegends extends FarmTemplate {
    constructor() {
        super(
            'league-of-legends',
            'League Of Legends',
            'https://lolesports.com/'
        );
    }

    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
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
                        '#riotbar-right-content > div.undefined.riotbar-account-reset._2f9sdDMZUGg63xLkFmv-9O.riotbar-account-container > div > a'
                    );

                    await page.waitForNavigation();

                    /**
                     * Wait for either the user has been redirected to the main page
                     * logged in *or* redirected to the login page.
                     */
                    const finishedSelector = await Promise.race([
                        waitForElementToAppear(
                            page,
                            'div.riotbar-summoner-name'
                        ),
                        waitForElementToAppear(
                            page,
                            'body > div:nth-child(3) > div > div > div.grid.grid-direction__row.grid-page-web__content > div > div > div.grid.grid-align-center.grid-justify-space-between.grid-fill.grid-direction__column.grid-panel-web__content.grid-panel__content > div > div > div > div:nth-child(1) > div > input'
                        )
                    ]);

                    /**
                     * Returns either `DIV` if at home route or `INPUT` if at login.
                     */
                    const tagName = await getElementTagName(
                        page,
                        finishedSelector!
                    );

                    if (tagName === 'DIV') {
                        log('MAIN', 'DEBUG', `${this.id}: Login completed`);
                        resolve(undefined);
                    } else if (tagName === 'INPUT') {
                        log(
                            'MAIN',
                            'DEBUG',
                            `${this.id}: Login is needed by user`
                        );

                        emitEvent(EventChannels.LoginForFarm, {
                            id: this.id,
                            shown: this.shown,
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
                        waitForElementToAppear(
                            page,
                            'div.riotbar-summoner-name',
                            0
                        ).then(() => {
                            log('MAIN', 'DEBUG', `${this.id}: Login completed`);
                            sendOneWay(getMainWindow(), IpcChannels.farmLogin, {
                                id: this.id,
                                needed: false
                            });
                            resolve(undefined);
                        });
                    }
                } else {
                    log(
                        'MAIN',
                        'DEBUG',
                        `${this.id}: User already logged in, continuing`
                    );
                    resolve(undefined);
                }
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
                await page.goto(
                    'https://lolesports.com/schedule?leagues=lec,european-masters,primeleague,cblol-brazil,lck,lcl,lco,lcs,ljl-japan,lla,lpl,pcs,turkiye-sampiyonluk-ligi,worlds,all-star,cblol_academy,college_championship,esports_balkan_league,elite_series,greek_legends,hitpoint_masters,lck_academy,lck_challengers_league,lcs-academy,proving_grounds,lfl,liga_portuguesa,nlc,pg_nationals,superliga,ultraliga,lcs_amateur,msi'
                );

                /**
                 * Wait until the events are found.
                 */
                await page.waitForSelector('div.events', { timeout: 0 });

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
                        hrefs.push(
                            await (
                                await element.getProperty('href')
                            ).jsonValue()
                        );

                    log(
                        'MAIN',
                        'DEBUG',
                        `${this.id}: Got ${hrefs.length} matches`
                    );
                    resolve(hrefs);
                } else {
                    log('MAIN', 'DEBUG', `${this.id}: No matches found`);
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
                        'MAIN',
                        'DEBUG',
                        `${this.id}: No farming windows, skipping checking step`
                    );
                    resolve(undefined);
                } else {
                    log(
                        'MAIN',
                        'DEBUG',
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
                    for (const farmingWindow of this.farmers) {
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
                    }

                    if (destroyedWindowsAmount > 0)
                        log(
                            'MAIN',
                            'DEBUG',
                            `${this.id}: No farming windows destroyed`
                        );
                    else
                        log(
                            'MAIN',
                            'DEBUG',
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
                    let hrefs: string[] = [];

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
                    for (const href of hrefs) {
                        this.createArrayWindow(href, this.farmers);
                    }

                    /**
                     * Clear hrefs array.
                     */
                    hrefs = [];

                    /**
                     * Change status to farming.
                     */
                    log(
                        'MAIN',
                        'DEBUG',
                        `${this.id}: Farming with "${this.farmers.length}" windows`
                    );

                    this.updateStatus('farming');
                    resolve(undefined);
                } else {
                    /**
                     * No live matches available.
                     * Set app farm status back to idle.
                     */
                    log(
                        'MAIN',
                        'DEBUG',
                        `${this.id}: No live matches available, returning status back to idle`
                    );
                    this.updateStatus('idle');

                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}
