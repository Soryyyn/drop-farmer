import { API } from '../api';

declare global {
    interface Window {
        api: typeof API;
    }
}
