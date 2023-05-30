import {
    CancellablePromise,
    PromiseWithAssignedUUID
} from '@df-types/promises.types';
import makeCancellablePromise from 'make-cancellable-promise';
import { log } from './logging';
import { generateUUID } from './strings';

/**
 * Keep track of the running promises inside a map.
 */
const promises = new Map<string, CancellablePromise>();

/**
 * Create a cancellable promise from a basic promise.
 */
export function createCancellablePromiseFrom(promise: Promise<unknown>) {
    const cancellablePromise: CancellablePromise =
        makeCancellablePromise(promise);

    /**
     * Set the cancellable promise inside the map.
     */
    const uuid = generateUUID();
    promises.set(uuid, cancellablePromise);

    return {
        uuid,
        promise: cancellablePromise.promise
    } as PromiseWithAssignedUUID;
}

/**
 * Cancel the promise by the id.
 */
export function cancelPromise(uuid: string) {
    const promise = promises.get(uuid);

    if (!promise) {
        log('warn', `Can't cancel promise with uuid ${uuid}`);
        return;
    }

    /**
     * Cancel the promise and remove it from the map.
     */
    promise.cancel();
    promises.delete(uuid);
}
