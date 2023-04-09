import Model from '@components/global/Model';
import Navigation from '@components/global/Navigation';
import { useAppVersion } from '@hooks/useAppVersion';
import React from 'react';
import Sidebar from './Sidebar';

/**
 * The route for the main page of the application.
 */
export default function Dashboard() {
    const appVersion = useAppVersion();

    return (
        <>
            <div className="flex flex-row h-full gap-8">
                <Sidebar />
                <div className="relative flex grow justify-center items-center">
                    <div className="w-full h-full flex flex-col">
                        <div className="h-full w-full flex flex-col justify-center">
                            <span className="w-3/4 self-center">
                                <Model
                                    src="../assets/crate-falling.webm"
                                    type="video/webm"
                                    loop={true}
                                />
                            </span>
                            <p className="self-center w-fit font-extrabold tracking-wide text-5xl text-center uppercase bg-gradient-to-tr from-pepper-200 to-pepper-500 text-transparent bg-clip-text drop-shadow-lg">
                                Drop Farmer
                            </p>
                            <span className="text-center w-fit self-center text-pepper-200/75 -mt-1 font-medium flex flex-row gap-1 items-center">
                                <p className="px-1">v{appVersion}</p>
                                <p>-</p>
                                <p className="hover:bg-pepper-900/50 rounded px-1 py-0.5 cursor-pointer">
                                    Changelog
                                </p>
                            </span>
                        </div>
                        <Navigation />
                    </div>
                </div>
            </div>
        </>
    );
}
