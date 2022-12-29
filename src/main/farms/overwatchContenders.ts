import { getPage } from 'puppeteer-in-electron';
import { EventChannels, IpcChannels } from '../common/constants';
import { sendOneWay } from '../electron/ipc';
import { getMainWindow } from '../electron/windows';
import { emitEvent } from '../util/events';
import { log } from '../util/logger';
import { createNotification } from '../util/notifications';
import {
    doesElementExist,
    getBrowserConnection,
    pageUrlContains,
    waitForElementToAppear,
    waitForTimeout
} from '../util/puppeteer';
import FarmTemplate from './template';

export default class OverwatchContenders extends FarmTemplate {
    constructor() {
        super(
            'overwatch-contenders',
            'Overwatch: Contenders',
            'https://www.youtube.com/c/OverwatchContenders'
        );
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
                        'MAIN',
                        'DEBUG',
                        `${this.id}: Stream still live, continuing farming`
                    );
                    resolve(undefined);
                } else {
                    /**
                     * Close the farming window.
                     */
                    this.destroyWindowFromArray(this.farmers, window);

                    log(
                        'MAIN',
                        'DEBUG',
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
            try {
                const page = await getPage(getBrowserConnection(), window);
                await page.waitForNetworkIdle();

                /**
                 * Check if user agreement is shown.
                 */
                const userAgreementSelector =
                    '#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.qqtRac > div.VtwTSb > form:nth-child(3) > div > div > button > div.VfPpkd-RLmnJb';

                if (await doesElementExist(page, userAgreementSelector)) {
                    await page.click(userAgreementSelector);
                    await page.waitForNavigation();

                    log('MAIN', 'INFO', `${this.id}: Accepted user agreement`);
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
                const signinRoute = 'https://www.youtube.com/signin';
                await page.goto(signinRoute);
                await waitForTimeout(3000);
                log('MAIN', 'DEBUG', `${this.id}: Navigation to login route`);

                if (await pageUrlContains(page, 'accounts.google.com')) {
                    log('MAIN', 'DEBUG', `${this.id}: Login is needed by user`);

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
                        log('MAIN', 'DEBUG', `${this.id}: Login completed`);
                        sendOneWay(getMainWindow(), IpcChannels.farmLogin, {
                            id: this.id,
                            needed: false
                        });
                        resolve(undefined);
                    } else {
                        await page.goto(this.url);
                        await page.waitForNavigation();
                        log('MAIN', 'DEBUG', `${this.id}: Login completed`);
                        sendOneWay(getMainWindow(), IpcChannels.farmLogin, {
                            id: this.id,
                            needed: false
                        });
                        resolve(undefined);
                    }
                } else {
                    log('MAIN', 'DEBUG', `${this.id}: Login completed`);
                    sendOneWay(getMainWindow(), IpcChannels.farmLogin, {
                        id: this.id,
                        needed: false
                    });
                    resolve(undefined);
                }
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
                const page = await getPage(getBrowserConnection(), window);
                await page.waitForNetworkIdle();

                /**
                 * Re-route to checker route for safety.
                 */
                await page.goto(this.url);
                await waitForTimeout(1000);

                /**
                 * Check if any live indicator is shown before 10seconds expire.
                 */
                const liveIndicatorSelector =
                    'ytd-thumbnail-overlay-time-status-renderer[overlay-style=LIVE]';
                await waitForElementToAppear(
                    page,
                    liveIndicatorSelector,
                    10000
                ).then((appeared) => {
                    if (appeared) {
                        log('MAIN', 'DEBUG', `${this.id}: Found livestream`);
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
                                    'MAIN',
                                    'DEBUG',
                                    `${this.id}: Farming with "${this.farmers.length}" windows`
                                );
                                this.updateStatus('farming');
                                resolve(undefined);
                            }
                        );
                    } else {
                        log(
                            'MAIN',
                            'DEBUG',
                            `${this.id}: No livestream found, no need to farm`
                        );
                        this.updateStatus('idle');
                        resolve(undefined);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}
