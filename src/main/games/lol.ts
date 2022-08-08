import { controlWindow } from "../puppeteer";
import { GameFarmTemplate } from "./gameFarmTemplate";

/**
 * Schedule link
 * https://lolesports.com/schedule?leagues=lec,european-masters,primeleague,cblol-brazil,lck,lcl,lco,lcs,ljl-japan,lla,lpl,pcs,turkiye-sampiyonluk-ligi,worlds,all-star,cblol_academy,college_championship,esports_balkan_league,elite_series,greek_legends,hitpoint_masters,lck_academy,lck_challengers_league,lcs-academy,proving_grounds,lfl,liga_portuguesa,nlc,pg_nationals,superliga,ultraliga,lcs_amateur,msi
 */

/**
 * League of Legends game farm.
 */
export class LOL extends GameFarmTemplate {
    constructor() {
        super(
            "league-of-legends",
            true,
            "https://lolesports.com/"
        );
    }

    /**
     * Create the checker window and login.
     * Check the lol schedule after loging in.
     *
     * NOTE: Multiple errors may be thrown here because the elements are not
     * found. They are being found.
     */
    login() {
        /**
         * Create the checker window.
         */
        this.createFarmCheckingWindow();

        /**
         * Once the window is ready.
         */
        this.checkerWindow!.on("ready-to-show", async () => {
            try {
                /**
                 * Control the checker window.
                 */
                const window = await controlWindow(this.checkerWindow!);

                /**
                 * Click the "login" button on the top right.
                 */
                await window.click('#riotbar-right-content > div.undefined.riotbar-account-reset._2f9sdDMZUGg63xLkFmv-9O.riotbar-account-container > div > a');

                /**
                 * Wait until the page has navigated to the new route.
                 */
                // await window.waitForNavigation();
                await window.waitForTimeout(2000);

                /**
                 * Check if user needs to login by checking if the input element
                 * for the username is found.
                 */
                let usernameInputSelector = await window.$("body > div:nth-child(3) > div > div > div.grid.grid-direction__row.grid-page-web__content > div > div > div.grid.grid-align-center.grid-justify-space-between.grid-fill.grid-direction__column.grid-panel-web__content.grid-panel__content > div > div > div > div:nth-child(1) > div > input");

                if (usernameInputSelector !== null) {
                    console.log("needs to login");
                } else {
                    console.log("does not need to login");

                }
            } catch (error) {
                // ignore errors thrown by not finding the element.
            }
        });
    }

    farmCheck(timeOfCheck: Date) {
        this.changeStatus("checking");

        this.login();
    }

    startFarming(): void {

    }
}