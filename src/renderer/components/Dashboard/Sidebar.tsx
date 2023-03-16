import { FarmContextProvider } from '@contexts/FarmContext';
import { FarmsContext } from '@contexts/FarmsContext';
import React, { useContext } from 'react';
import AddFarmButton from './AddFarmButton';
import SidebarItem from './SidebarItem';

export default function Sidebar() {
    const { farms } = useContext(FarmsContext);

    return (
        <div className="flex flex-col gap-4 min-w-[40%] h-full">
            <ul className="flex flex-col gap-4 grow bg-pepper-900/75 rounded-lg p-8">
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
