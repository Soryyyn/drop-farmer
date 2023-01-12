import { Icon } from '@components/global/Icon';
import Tooltip from '@components/global/Tooltip';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

export default function ProtecedIndicator() {
    return (
        <Tooltip
            placement="bottom"
            text="This farm is protected and comes with drop-farmer. This means, this farm can't be deleted."
        >
            <div className="h-[33px] w-[33px] flex items-center justify-center text-pepper-200 aspect-square p-1 rounded bg-pepper-800">
                <Icon sprite={faShieldHalved} size="1x" />
            </div>
        </Tooltip>
    );
}
