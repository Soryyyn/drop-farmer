type FarmStatus =
    | 'farming'
    | 'idle'
    | 'checking'
    | 'disabled'
    | 'attention-required';
type FarmType = 'default' | 'custom';

type FarmingWindowObject = {
    window: Electron.BrowserWindow;
    createdAt: number;
};

type BasicToast = {
    id: string;
    textOnSuccess: string;
    textOnError: string;
    duration: number;
};

type PromiseToast = {
    id: string;
    textOnLoading: string;
    textOnSuccess: string;
    textOnError: string;
    duration: number;
};

type ForcedTypeToast = {
    id: string;
    type: 'success' | 'error' | 'loading';
    text: string;
    duration: number;
};

type ToastFromMain = {
    id: string;
    text: string;
    duration: number;
    type?: 'success' | 'error';
};

type DropdownItem = {
    type: 'label' | 'seperator';
    label?: string;
    disabled?: boolean;
    action?: () => void;
};

/**
 * The type of a single setting.
 * NOTE: Value accepts undefined here, because there may not be a value stored
 * in the settings atm.
 *
 * NOTE: `max` and `min` are only needed for a number value.
 */
type Setting = {
    name: string;
    shownName: string;
    description: string;
    value: number | string | boolean | undefined;
    defaultValue: number | string | boolean;
    changingDisabled?: boolean;
    max?: number;
    min?: number;
};

/**
 * The whole settings object which accepts multiple keys with setting arrays.
 */
type Settings = {
    [name: string]: Setting[];
};

/**
 * A single cached setting used to write to the config file.
 */
type CachedSetting = {
    [name: string]: number | string | boolean | undefined;
};
type CachedSettings = {
    [name: string]: CachedSetting;
};

/**
 * Farm data which get saved for each farm in the config file.
 */
type CachedFarm = {
    uptime: number;
};
type CachedFarms = {
    [name: string]: CachedFarm;
};

type SidebarFarmItem = {
    name: string;
    type: FarmType;
    status: FarmStatus;
};

type ConfigFile = {
    version: string;
    farms: CachedFarms;
    settings: CachedSettings;
};

/**
 * For renderer to know the preload types.
 */
declare const api: typeof import('../api').default;
