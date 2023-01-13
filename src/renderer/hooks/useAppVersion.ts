import { useState } from 'react';
import { useSendAndWait } from './useSendAndWait';

export function useAppVersion() {
    const [appVersion, setAppVersion] = useState<string>('');

    useSendAndWait({
        channel: api.channels.getApplicationVersion,
        callback(err, applicationVersion: string) {
            if (!err) setAppVersion(applicationVersion);
        }
    });

    return appVersion;
}
