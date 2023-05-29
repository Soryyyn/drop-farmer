export type CancellablePromise = {
    promise: Promise<unknown>;
    cancel: () => void;
};

export type PromiseWithAssignedUUID = {
    uuid: string;
    promise: Promise<unknown>;
};
