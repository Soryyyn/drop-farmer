import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Class for managing the settings file and the system around it.
 */
export default class Settings {
    // TODO: change to app path, when refactored
    private _settingsFilePath: string = join(__dirname, "..", "settings.json");
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
        this._settings = this.readSettingsFile();
    }

    /**
     * Get the current settings.
     * Also re-reads the settings file to get actual **current** settings.
     */
    public getCurrentSettings() {
        if (this._settings) {
            this._settings = this.readSettingsFile();
            return this._settings;
        }
    }

    /**
     * Read the settings file from the set filepath.
     * Also checks if the settings file exists, if not it creates a new default one.
     */
    public readSettingsFile(): any {
        if (!existsSync(this._settingsFilePath)) {
            this.createSettingsFile();
        }

        // TODO: re-work error throwing to make app not crash, when reading settings file fails? (fallback to default)
        try {
            let fileData: string = readFileSync(this._settingsFilePath).toString();
            return JSON.parse(fileData);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Write a new default settigns file into the application directory.
     */
    private createSettingsFile() {
        try {
            writeFileSync(this._settingsFilePath, JSON.stringify(this._defaultSettings, null, 4));
        } catch (err) {
            throw err;
        }
    }
}