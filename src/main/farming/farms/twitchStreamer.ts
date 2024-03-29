import { FarmingConditions } from '@df-types/farms.types';
import { EventChannels } from '@main/common/constants';
import { emitEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    doesElementExist,
    getBrowserConnection,
    getElementChildren,
    gotoURL,
    waitForElementToAppear,
    waitForTimeout
} from '@main/util/puppeteer';
import { getPage } from 'puppeteer-in-electron';
import FarmTemplate from '../template';

export default class TwitchStreamer extends FarmTemplate {
    constructor(
        id: string,
        url: string,
        schedule?: number,
        conditions?: FarmingConditions
    ) {
        super(`twitch/${id}`, url);

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

    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);

                /**
                 * Get the login button
                 */
                const loginButton =
                    'button[data-test-selector="anon-user-menu__login-button"]';
                if (
                    (await waitForElementToAppear(page, loginButton)) !== null
                ) {
                    log('info', `${this.id}: Login is needed by user`);

                    /**
                     * Navigate to login page.
                     */
                    await gotoURL(page, 'https://www.twitch.tv/login');

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

                    await waitForElementToAppear(
                        page,
                        'div.root-scrollable__wrapper',
                        0
                    );

                    await gotoURL(page, this.url);

                    log('info', `${this.id}: Login completed`);
                    resolve(undefined);
                } else {
                    log(
                        'info',
                        `${this.id}: User already logged in, continuing`
                    );
                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    stillFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);

                /**
                 * Check for *LIVE* text on profile of streamer.
                 */
                if (
                    await doesElementExist(page, 'div.live-indicator-container')
                ) {
                    log(
                        'info',
                        `${this.id}: Stream still live, continue farming`
                    );
                    resolve(undefined);
                } else {
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

    startFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);

                if (this.farmers.length === 0) {
                    /**
                     * Wait a bit for the page to load.
                     */
                    await waitForTimeout(2000);

                    /**
                     * Check if the *LIVE* container is present.
                     */
                    if (
                        await doesElementExist(
                            page,
                            'div.live-indicator-container'
                        )
                    ) {
                        log('info', `${this.id}: Found livestream`);

                        /**
                         * Create the farming window and open the livestream.
                         */
                        this.createArrayWindow(this.url, this.farmers).then(
                            async (window) => {
                                const page = await getPage(
                                    getBrowserConnection(),
                                    window
                                );

                                /**
                                 * Check if the stream is only for mature users.
                                 */
                                if (
                                    await doesElementExist(
                                        page,
                                        'button[data-a-target="player-overlay-mature-accept"]'
                                    )
                                ) {
                                    await page.click(
                                        'button[data-a-target="player-overlay-mature-accept"]'
                                    );
                                    await waitForTimeout(2000);

                                    log(
                                        'info',
                                        `${this.id}: Needed to accept mature stream`
                                    );
                                }

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
                            `${this.id}: Stream not live, no need to farm`
                        );

                        resolve(undefined);
                    }
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

    setLowestQualityPossible(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const page = await getPage(
                    getBrowserConnection(),
                    this.farmers[0]
                );

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
                 * Reload the page.
                 */
                await page.reload();

                log('info', `${this.id}: Set to lowest resolution possible`);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}
