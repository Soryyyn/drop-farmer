import { FarmingConditions } from '@df-types/farms.types';
import { EventChannels, IpcChannels } from '@main/common/constants';
import { getNumbersInsideString } from '@main/common/string.helper';
import { sendOneWay } from '@main/electron/ipc';
import { minutesAndSecondsToMS } from '@main/util/calendar';
import { emitEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    doesElementExist,
    getBrowserConnection,
    getElementChildren,
    getInnerHTMLOfElement,
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

    stillFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);
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
                    this.destroyWindowFromArray(this.farmers, this.farmers[0]);

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

    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            let wasLoginNeeded = false;

            try {
                const page = await getPage(getBrowserConnection(), window);

                /**
                 * Check if user agreement is shown.
                 */
                if (await pageUrlContains(page, 'consent.youtube.com')) {
                    await page.click('div.VfPpkd-Jh9lGc');
                    log('info', `${this.id}: Accepted user agreement`);
                }

                /**
                 * Small timeout for safety.
                 */
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

    startFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                if (this.farmers.length === 0) {
                    const page = await getPage(getBrowserConnection(), window);

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
                                        'div.style-scope.ytd-video-renderer';
                                    await farmingWindowPage.click(
                                        firstVideoSelector
                                    );

                                    await this.handleAds();

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

    handleAds(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const page = await getPage(
                    getBrowserConnection(),
                    this.farmers[0]
                );

                const adContainer = await waitForElementToAppear(
                    page,
                    'div.video-ads.ytp-ad-module'
                );

                await waitForTimeout(2000);

                const adContainerChildren = await getElementChildren(
                    adContainer
                );

                if (adContainerChildren.length > 0) {
                    const amountOfAds = getNumbersInsideString(
                        await getInnerHTMLOfElement(
                            page,
                            'span.ytp-ad-simple-ad-badge > div'
                        )
                    );

                    /**
                     * If there is a single ad, the "Ad ? of ?" will not be
                     * displayed, so pushing a "ad" to the array.
                     */
                    if (amountOfAds.length === 0) {
                        amountOfAds.push(1);
                        amountOfAds.push(1);
                    }

                    log(
                        'info',
                        `${this.id}: ${amountOfAds[1]} Ads found, waiting for ads to finish`
                    );

                    /**
                     * Wait for each ad to finish.
                     */
                    for await (const ad of amountOfAds) {
                        /**
                         * Get the rest of ad time on the current ad.
                         */
                        const timeAsString = await getInnerHTMLOfElement(
                            page,
                            'span.ytp-ad-duration-remaining > div'
                        );
                        const milliseconds =
                            minutesAndSecondsToMS(timeAsString);

                        await waitForTimeout(milliseconds + 10000);
                    }

                    log('info', `${this.id}: Finished awaiting ads`);
                } else {
                    log('info', `${this.id}: No ads found`);
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    setLowestQualityPossible(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const page = await getPage(
                    getBrowserConnection(),
                    this.farmers[0]
                );

                /**
                 * Click on the settings button.
                 */
                await page.click('button.ytp-settings-button');

                if (await doesElementExist(page, 'div.ytp-settings-menu')) {
                    /**
                     * Click the quality setting on the settings menu.
                     */
                    await page.click(
                        'div.ytp-popup.ytp-settings-menu.ytp-rounded-menu > div.ytp-panel > div.ytp-panel-menu > div.ytp-menuitem:nth-child(3)'
                    );

                    /**
                     * Get all quality options.
                     */
                    const qualityMenu = await page.$(
                        'div.ytp-panel.ytp-quality-menu'
                    );

                    await waitForTimeout(1000);

                    /**
                     * Quality options.
                     */
                    const qualityOptions = (
                        await getElementChildren(qualityMenu)
                    )[1];

                    /**
                     * Click the last quality option (excluding the automatic).
                     */
                    const allQualityOptions = await getElementChildren(
                        qualityOptions
                    );
                    await allQualityOptions[
                        allQualityOptions.length - 2
                    ].click();
                }

                log('info', `${this.id}: Set to lowest resolution possible`);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}
