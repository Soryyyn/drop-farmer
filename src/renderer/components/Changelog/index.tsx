import OverlayContainer from '@components/global/Overlay/OverlayContainer';
import OverlayContent from '@components/global/Overlay/OverlayContent';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSendAndWait } from '@hooks/useSendAndWait';
import React, { useState } from 'react';

type Props = {
    onClose: () => void;
};

export default function Changelog({ onClose }: Props) {
    const [changelog, setChangelog] = useState('');

    useSendAndWait({
        channel: api.channels.getChangelog,
        callback: (err, changelogString) => {
            if (!err) setChangelog(changelogString);
        }
    });

    return (
        <OverlayContainer>
            <OverlayContent
                buttons={[
                    {
                        icon: faXmark,
                        caution: true,
                        onClick: () => onClose()
                    }
                ]}
            >
                <p>{changelog}</p>
            </OverlayContent>
        </OverlayContainer>
    );
}
