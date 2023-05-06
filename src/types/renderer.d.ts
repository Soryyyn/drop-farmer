import { API } from '../main/exposed/api';

declare global {
    interface Window {
        api: typeof API;
    }
}
