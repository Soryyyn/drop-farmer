import { API } from '@exposed/api';

declare global {
    interface Window {
        api: typeof API;
    }
}
