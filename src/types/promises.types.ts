export type CancellablePromise = {
    promise: Promise<unknown>;
    cancel: () => void;
};
