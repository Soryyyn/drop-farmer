import { Toast as ToastId } from '@main/util/constants';

export type ToastType = 'success' | 'error' | 'loading' | 'basic' | 'promise';

export type Toast = {
    type: ToastType;
    id: ToastId | string;
    duration: number;
    textOnSuccess?: string;
    textOnError?: string;
    textOnLoading?: string;
};
