import { FarmContext } from '@util/contexts';
import React, { useContext } from 'react';

export default function SidebarItem() {
    const { farm, setWindowsVisibility, clearCache, restartSchedule } =
        useContext(FarmContext);

    return <div>{farm?.name}</div>;
}
