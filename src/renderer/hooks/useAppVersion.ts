import { useState } from 'react';
import { useSendAndWait } from './useSendAndWait';

export function useAppVersion() {
    const [appVersion, setAppVersion] = useState<string>('');

    useSendAndWait(
        api.channels.getApplicationVersion,
        null,
        (err, applicationVersion: string) => {
            if (!err) setAppVersion(applicationVersion);
        }
    );

    return appVersion;
}
