import { OverlayContainer } from '@components/global/Overlay/OverlayContainer';
import OverlayContent from '@components/global/Overlay/OverlayContent';
import { ActionButton } from '@components/Settings/ActionButton';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

interface Props {
    onClose: () => void;
}

export default function NewFarm({ onClose }: Props) {
    return (
        <OverlayContainer>
            <OverlayContent
                buttons={[
                    <ActionButton
                        key="close"
                        icon={faXmark}
                        onClick={onClose}
                    />
                ]}
            >
                <p>test</p>
            </OverlayContent>
        </OverlayContainer>
    );
}
