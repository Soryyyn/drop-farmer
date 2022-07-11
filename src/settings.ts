import { readFile, createFile } from "./fileHandling";

/**
 * Class for managing the settings file and the system around it.
 */
export default class Settings {
    // TODO: change to app path, when refactored
    private _settingsFile: string = "settings.json";
    private _defaultSettings = {
        headless: false,
        autoRestart: false,
        launchOnStartup: false,
        players: [],
        farms: []
    };
    private _settings: Object;

    /**
     * Read the settings file and save it in the class on class init.
     */
    constructor() {
        this.createSettingsFile();
        this._settings = this.readSettingsFile();
    }

    /**
     * Get the current settings.
     * Also re-reads the settings file to get actual **current** settings.
     */
    public getCurrentSettings(): Object {
        if (this._settings) {
            this._settings = this.readSettingsFile();
            return this._settings;
        } else {
            throw new Error("Settings not available. Are the settings loaded?");
        }
    }

    /**
     * Read the settings file from the set filepath.
     * Also checks if the settings file exists, if not it creates a new default one.
     */
    public readSettingsFile(): Object {
        let fileData = readFile(this._settingsFile);
        return JSON.parse(fileData);
    }

    /**
     * Write a new default settigns file into the application directory.
     */
    private createSettingsFile(): void {
        createFile(this._settingsFile, JSON.stringify(this._defaultSettings, null, 4));
    }
}