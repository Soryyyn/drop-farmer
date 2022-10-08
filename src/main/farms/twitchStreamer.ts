import { getPage } from "puppeteer-in-electron";
import { log } from "../util/logger";
import { getBrowserConnection } from "../util/puppeteer";
import FarmTemplate from "./template";

export default class TwitchStreamer extends FarmTemplate {
    /**
     * To make this farm work, we need a specific name and twitch url to load
     * which is different from each farm.
     */
    constructor(name: string, twitchURL: string) {
        super(
            name,
            twitchURL,
            "custom"
        );
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
                const userDropdownButton = await page.$("[data-a-target=user-menu-toggle]");

                if (Object.keys(await (await userDropdownButton!.getProperty("classList")).jsonValue()).length != 0) {
                    log("MAIN", "DEBUG", `${this.getName()}: Login is needed by user`);

                    /**
                     * Navigate to login page.
                     */
                    await page.goto("https://www.twitch.tv/login");

                    window.show();
                    window.focus();

                    /**
                     * Wait until the followed channels are showing.
                     */
                    page.waitForSelector(".top-name__menu", { timeout: 0 })
                        .then(() => {
                            log("MAIN", "DEBUG", `${this.getName()}: Login completed`);
                            window.hide();
                            resolve(undefined);
                        });
                } else {
                    log("MAIN", "DEBUG", `${this.getName()}: User already logged in, continuing`);
                    resolve(undefined);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    windowsStillFarming(window?: Electron.BrowserWindow | undefined): Promise<any> {
        throw new Error("Method not implemented.");
    }

    startFarming(window?: Electron.BrowserWindow | undefined): Promise<any> {
        throw new Error("Method not implemented.");
    }
}