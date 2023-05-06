import { FarmContextProvider } from '@renderer/contexts/FarmContext';
import { FarmsContext } from '@renderer/contexts/FarmsContext';
import React, { useContext } from 'react';
import AddFarmButton from './AddFarmButton';
import SidebarItem from './SidebarItem';

export default function Sidebar() {
    const { farms } = useContext(FarmsContext);

    return (
        <div className="flex flex-col gap-4 min-w-[40%] h-full">
            <ul className="flex flex-col gap-4 grow rounded-lg">
                {farms.map((farm) => {
                    return (
                        <FarmContextProvider farm={farm} key={farm.id}>
                            <SidebarItem />
                        </FarmContextProvider>
                    );
                })}
            </ul>
            <AddFarmButton />
        </div>
    );
}
