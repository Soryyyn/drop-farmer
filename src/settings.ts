import { readFile, createFile } from "./fileHandling";

/**
 * Class for managing the settings file and the system around it.
 */
export default class Settings {
    private _fileName: string = "settings.json";
    private _defaultSettings = {
        headless: false,
        autoRestart: false,
        launchOnStartup: false,
        players: [],
        farms: []
    };
    private _settings: Object | undefined;

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
    public getCurrentSettings(): Object | undefined {
        if (this._settings) {
            this._settings = this.readSettingsFile();
            return this._settings;
        } else {
            // TODO: send event for error?
        }
    }

    /**
     * Read the settings file from the set filepath.
     * Also checks if the settings file exists, if not it creates a new default one.
     */
    public readSettingsFile(): Object | undefined {
        try {
            let fileData = readFile(this._fileName);
            return JSON.parse(fileData);
        } catch (err) {
            // TODO: send event for error?
        }
    }

    /**
     * Write a new default settigns file into the application directory.
     */
    private createSettingsFile(): void {
        try {
            createFile(this._fileName, JSON.stringify(this._defaultSettings, null, 4));
        } catch (err) {
            // TODO: send event for error?
        }

    }
}