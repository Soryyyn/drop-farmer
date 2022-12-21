import { FarmContextProvider, FarmsContext } from '@util/contexts';
import React, { useContext } from 'react';

export default function Sidebar() {
    const { farms } = useContext(FarmsContext);

    return (
        <ul className="flex flex-col gap-4 min-w-[40%] grow bg-pepper-900/75 rounded-lg p-8">
            {farms.map((farm) => {
                return (
                    <FarmContextProvider farm={farm} key={farm.name}>
                        <p>{farm.name}</p>
                    </FarmContextProvider>
                );
            })}
        </ul>
    );
}
