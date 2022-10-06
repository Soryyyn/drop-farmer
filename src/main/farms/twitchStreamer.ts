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

    login(window?: Electron.BrowserWindow | undefined): Promise<any> {
        throw new Error("Method not implemented.");
    }

    windowsStillFarming(window?: Electron.BrowserWindow | undefined): Promise<any> {
        throw new Error("Method not implemented.");
    }

    startFarming(window?: Electron.BrowserWindow | undefined): Promise<any> {
        throw new Error("Method not implemented.");
    }
}