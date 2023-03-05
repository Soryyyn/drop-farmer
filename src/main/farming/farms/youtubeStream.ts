import { EventChannels, IpcChannels } from '@main/common/constants';
import { sendOneWay } from '@main/electron/ipc';
import { emitEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    doesElementExist,
    getBrowserConnection,
    gotoURL,
    pageUrlContains,
    waitForElementToAppear,
    waitForTimeout
} from '@main/util/puppeteer';
import { getPage } from 'puppeteer-in-electron';
import FarmTemplate from '../template';

export default class YoutubeStream extends FarmTemplate {
    constructor(
        id: string,
        isProtected: boolean,
        url: string,
        schedule?: number,
        conditions?: FarmingConditions
    ) {
        super(`youtube/${id}`, url, isProtected);

        /**
         * If a schedule is provided, set it too.
         */
        if (schedule) {
            this.schedule = schedule;
        }

        if (conditions) {
            this.conditions = conditions;
            this.updateConditions();
        }
    }

    /**
     * Check if farm can still farm.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    stillFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);
                await page.waitForNetworkIdle();
                await waitForTimeout(10000);

                /**
                 * Check if there are any video elements with a live element
                 * attached to it.
                 */
                if (
                    await doesElementExist(
                        page,
                        'ytd-thumbnail-overlay-time-status-renderer[overlay-style=LIVE]'
                    )
                ) {
                    log(
                        'info',
                        `${this.id}: Stream still live, continuing farming`
                    );
                    resolve(undefined);
                } else {
                    /**
                     * Close the farming window.
                     */
                    await this.destroyWindowFromArray(this.farmers, window);

                    log(
                        'info',
                        `${this.id}: Stream not live anymore, stopping farming`
                    );
                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Login on the yt website for drops.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            let wasLoginNeeded = false;

            try {
                const page = await getPage(getBrowserConnection(), window);
                await page.waitForNetworkIdle();

                /**
                 * Check if user agreement is shown.
                 */
                if (await pageUrlContains(page, 'consent.youtube.com')) {
                    await page.click('div.VfPpkd-Jh9lGc');
                    await page.waitForNavigation();
                    log('info', `${this.id}: Accepted user agreement`);
                }

                /**
                 * Small timeout for safety.
                 */
                await page.waitForNetworkIdle();
                await waitForTimeout(1000);

                /**
                 * Move to signin route.
                 * If after navigation the user ends up at login screen, login
                 * is needed, else login is finished.
                 */
                await gotoURL(page, 'https://www.youtube.com/signin', 3000);

                log('info', `${this.id}: Navigation to login route`);

                if (await pageUrlContains(page, 'accounts.google.com')) {
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
                     * Wait infinitely for signin input element or the yt logo
                     * element to appear.
                     */
                    const ytLogoSelector = 'div.ytd-topbar-logo-renderer';
                    const googleAccountSelector = 'div.T4LgNb';
                    void (await Promise.race([
                        waitForElementToAppear(page, ytLogoSelector, 0),
                        waitForElementToAppear(page, googleAccountSelector, 0)
                    ]));

                    if (!(await pageUrlContains(page, 'accounts.google.com'))) {
                        log('info', `${this.id}: Login completed`);
                    } else {
                        await gotoURL(page, this.url);
                        await page.waitForNavigation();
                        log('info', `${this.id}: Login completed`);
                    }
                } else {
                    await gotoURL(page, this.url, 3000);
                    log('info', `${this.id}: Login completed`);
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

    /**
     * Start farming.
     *
     * @param {Electron.BrowserWindow} window The window to control.
     */
    startFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                if (this.farmers.length === 0) {
                    const page = await getPage(getBrowserConnection(), window);
                    await page.waitForNetworkIdle();

                    /**
                     * Re-route to checker route for safety.
                     */
                    await gotoURL(page, this.url, 1000);

                    /**
                     * Check if any live indicator is shown before 10seconds expire.
                     */
                    const liveIndicatorSelector =
                        'ytd-thumbnail-overlay-time-status-renderer[overlay-style=LIVE]';
                    waitForElementToAppear(
                        page,
                        liveIndicatorSelector,
                        10000
                    ).then((appeared) => {
                        if (appeared) {
                            log('info', `${this.id}: Found livestream`);

                            /**
                             * Create the farming window and open the livestream.
                             */
                            this.createArrayWindow(this.url, this.farmers).then(
                                async (farmingWindow) => {
                                    const farmingWindowPage = await getPage(
                                        getBrowserConnection(),
                                        farmingWindow
                                    );
                                    await farmingWindowPage.waitForNetworkIdle();
                                    await waitForTimeout(2000);

                                    /**
                                     * Click on the first video element which is found.
                                     * In case of a livestream it is always the
                                     * first one.
                                     */
                                    const firstVideoSelector =
                                        '#contents > ytd-video-renderer';
                                    await farmingWindowPage.click(
                                        firstVideoSelector
                                    );

                                    log(
                                        'info',
                                        `${this.id}: Farming with "${this.farmers.length}" windows`
                                    );

                                    resolve(undefined);
                                }
                            );
                        } else {
                            log(
                                'info',
                                `${this.id}: No livestream found, no need to farm`
                            );

                            resolve(undefined);
                        }
                    });
                } else {
                    log(
                        'info',
                        `${this.id}: Already farming, no need to start again`
                    );

                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}
