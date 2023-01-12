import { EventChannels } from '@main/common/constants';
import { emitEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    doesElementExist,
    getBrowserConnection,
    getElementProperty,
    waitForElementToAppear,
    waitForTimeout
} from '@main/util/puppeteer';
import { normalize } from '@main/util/textManipulation';
import { getPage } from 'puppeteer-in-electron';
import FarmTemplate from '../template';

export default class TwitchStreamer extends FarmTemplate {
    constructor(
        id: string,
        shown: string,
        isProtected: boolean,
        url: string,
        schedule?: number
    ) {
        super(`twitch/${id}`, shown, url, isProtected);

        /**
         * If a schedule is provided, set it too.
         */
        if (schedule) {
            this.schedule = schedule;
        }
    }

    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);

                const userDropdownButton = '[data-a-target=user-menu-toggle]';
                const userDropdownButtonElement = await waitForElementToAppear(
                    page,
                    userDropdownButton
                );

                /**
                 * Get the user dropdown menu and check if the button element
                 * has classes added.
                 * If there are classes, the user is not logged in.
                 */
                if (
                    Object.keys(
                        await getElementProperty(
                            userDropdownButtonElement!,
                            'classList'
                        )
                    ).length !== 0
                ) {
                    log('info', `${this.id}: Login is needed by user`);

                    /**
                     * Navigate to login page.
                     */
                    await page.goto('https://www.twitch.tv/login');

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

                    await waitForElementToAppear(page, '.top-name__menu', 0);
                    log('info', `${this.id}: Login completed`);
                    window.hide();
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

                const liveIndicatorText =
                    '#live-channel-stream-information > div > div > div > div > div.Layout-sc-nxg1ff-0.wEGRY > div > div > div > a > div.Layout-sc-nxg1ff-0.ScHaloIndicator-sc-1l14b0i-1.ceXRHq.tw-halo__indicator > div > div > div > div > p';
                const element = await waitForElementToAppear(
                    page,
                    liveIndicatorText
                );

                /**
                 * Check for *LIVE* text on profile of streamer.
                 */
                if (element !== null) {
                    log(
                        'info',
                        `${this.id}: Stream still live, continue farming`
                    );
                    resolve(undefined);
                } else {
                    this.destroyWindowFromArray(this.farmers, window);
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
                            '#live-channel-stream-information > div > div > div > div > div.Layout-sc-nxg1ff-0.wEGRY > div > div > div > a > div.Layout-sc-nxg1ff-0.ScHaloIndicator-sc-1l14b0i-1.ceXRHq.tw-halo__indicator > div > div > div > div > p'
                        )
                    ) {
                        log('info', `${this.id}: Found livestream`);

                        /**
                         * Create the farming window and open the livestream.
                         */
                        this.createArrayWindow(this.url, this.farmers).then(
                            () => {
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
}
