import { Toast as TID } from '@main/common/constants';
import { ToastId } from '../rewrite/util/toast';

export type ToastType = 'success' | 'error' | 'loading' | 'basic' | 'promise';

export type Toast = {
    type: ToastType;
    id: TID | string;
    duration: number;
    textOnSuccess?: string;
    textOnError?: string;
    textOnLoading?: string;
};

export type ToastObject = {
    type: ToastType;
    id: ToastId;
    duration: number;
    textOnSuccess?: string;
    textOnError?: string;
    textOnLoading?: string;
};
