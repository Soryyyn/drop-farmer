import Icon from '@components/global/Icon';
import SquareContainer from '@components/global/SquareContainer';
import Tooltip from '@components/global/Tooltip';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

export default function ProtecedIndicator() {
    return (
        <SquareContainer
            tooltip="This farm is protected and comes with Drop Farmer. This means, this farm can't be deleted."
            tooltipPlacement="bottom"
            className="text-snow-300 aspect-square p-1 rounded bg-pepper-800"
        >
            <Icon sprite={faShieldHalved} size="1x" />
        </SquareContainer>
    );
}
