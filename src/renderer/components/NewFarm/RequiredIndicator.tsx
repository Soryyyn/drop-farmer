import { faStarOfLife } from '@fortawesome/free-solid-svg-icons';
import Icon from '@renderer/components/global/Icon';
import React from 'react';

export default function RequiredIndicator() {
    return (
        <div className="relative scale-75">
            <Icon
                sprite={faStarOfLife}
                className="text-blood-500 absolute -top-1 -left-0.5"
                size="xs"
            />
        </div>
    );
}
