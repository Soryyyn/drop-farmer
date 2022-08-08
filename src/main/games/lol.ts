import { controlWindow } from "../puppeteer";
import { GameFarmTemplate } from "./gameFarmTemplate";

export class LOL extends GameFarmTemplate {
    constructor() {
        super("league-of-legends", true, "https://lolesports.com/");
    }

    async login() {
        this.createFarmCheckingWindow();

        const windowPage = await controlWindow(this.checkerWindow!);

        // ignore error of "no selector found"
        await windowPage.click('#riotbar-right-content > div.undefined.riotbar-account-reset._2f9sdDMZUGg63xLkFmv-9O.riotbar-account-container > div > a');

        await windowPage.waitForTimeout(2000);

        let loginSelector = await windowPage.$("body > div:nth-child(3) > div > div > div.grid.grid-direction__row.grid-page-web__content > div > div > div.grid.grid-align-center.grid-justify-space-between.grid-fill.grid-direction__column.grid-panel-web__content.grid-panel__content > div > div > div > div:nth-child(1) > div > input")

        /**
         * Check if user needs to login.
         */
        if (loginSelector !== null) {
            console.log("needs to login");
        } else {
            console.log("doesnt need to login");
        }
    }

    farmCheck(timeOfCheck: Date) {
        this.changeStatus("checking");
        this.createFarmCheckingWindow();
    }

    startFarming(): void {

    }
}