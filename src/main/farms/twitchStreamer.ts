import { getPage } from 'puppeteer-in-electron';
import { log } from '../util/logger';
import { getBrowserConnection, waitForTimeout } from '../util/puppeteer';
import NewFarmTemplate from './newTemplate';

export default class TwitchStreamer extends NewFarmTemplate {
    /**
     * To make this farm work, we need a specific name and twitch url to load
     * which is different from each farm.
     */
    constructor(streamerName: string, twitchURL: string) {
        super(`twitch/${streamerName}`, streamerName, twitchURL);
    }

    login(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const page = await getPage(getBrowserConnection(), window);

                /**
                 * Get the user dropdown menu and check if the button element
                 * has classes added.
                 * If there are classes, the user is not logged in.
                 */
                const userDropdownButton = await page.$(
                    '[data-a-target=user-menu-toggle]'
                );

                if (
                    Object.keys(
                        await (
                            await userDropdownButton!.getProperty('classList')
                        ).jsonValue()
                    ).length != 0
                ) {
                    log('MAIN', 'DEBUG', `${this.id}: Login is needed by user`);

                    /**
                     * Navigate to login page.
                     */
                    await page.goto('https://www.twitch.tv/login');

                    window.show();
                    window.focus();

                    /**
                     * Wait until the followed IpcChannels are showing.
                     */
                    page.waitForSelector('.top-name__menu', {
                        timeout: 0
                    }).then(() => {
                        log('MAIN', 'DEBUG', `${this.id}: Login completed`);
                        window.hide();
                        resolve(undefined);
                    });
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

    stillFarming(window: Electron.BrowserWindow): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                if (this.farmers.length === 0) {
                    log(
                        'MAIN',
                        'DEBUG',
                        `${this.id}: No farming windows, skipping checking step`
                    );
                    resolve(undefined);
                } else {
                    const page = await getPage(getBrowserConnection(), window);

                    /**
                     * Check for *LIVE* text on profile of streamer.
                     */
                    if (
                        (await page.$(
                            '#live-channel-stream-information > div > div > div > div > div.Layout-sc-nxg1ff-0.wEGRY > div > div > div > a > div.Layout-sc-nxg1ff-0.ScHaloIndicator-sc-1l14b0i-1.ceXRHq.tw-halo__indicator > div > div > div > div > p'
                        )) != null
                    ) {
                        log(
                            'MAIN',
                            'DEBUG',
                            `${this.id}: Stream still live, continue farming`
                        );
                        resolve(undefined);
                    } else {
                        this.destroyWindowFromArray(this.farmers, window);

                        log(
                            'MAIN',
                            'DEBUG',
                            `${this.id}: Stream not live anymore, stopping farming`
                        );

                        resolve(undefined);
                    }
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

                if (this.farmers.length > 0) {
                    log(
                        'MAIN',
                        'DEBUG',
                        `${this.id}: Already farming, no need to start again`
                    );

                    this.updateStatus('farming');
                    resolve(undefined);
                } else {
                    /**
                     * Wait a bit for the page to load.
                     */
                    await waitForTimeout(2000);

                    /**
                     * Check if the *LIVE* container is present.
                     */
                    if (
                        (await page.$(
                            '#live-channel-stream-information > div > div > div > div > div.Layout-sc-nxg1ff-0.wEGRY > div > div > div > a > div.Layout-sc-nxg1ff-0.ScHaloIndicator-sc-1l14b0i-1.ceXRHq.tw-halo__indicator > div > div > div > div > p'
                        )) != null
                    ) {
                        log('MAIN', 'DEBUG', `${this.id}: Found livestream`);

                        /**
                         * Create the farming window and open the livestream.
                         */
                        this.createArrayWindow(this.url, this.farmers).then(
                            () => {
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
                            `${this.id}: Stream not live, no need to farm`
                        );
                        this.updateStatus('idle');

                        resolve(undefined);
                    }
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}
