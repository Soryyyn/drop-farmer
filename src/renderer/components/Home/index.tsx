import Model from '@components/global/Model';
import Navigation from '@components/global/Navigation';
import { useAppVersion } from '@hooks/useAppVersion';
import React from 'react';
import Sidebar from './Sidebar';

/**
 * The route for the main page of the application.
 */
export default function Home() {
    const appVersion = useAppVersion();

    return (
        <>
            <div className="flex flex-row h-full gap-8">
                <Sidebar />
                <div className="flex grow justify-center items-center !min-w-[60%]">
                    <div className="flex flex-col gap-3">
                        <div className="w-2/3 self-center -mb-5">
                            <Model
                                src="../assets/crate-falling.webm"
                                type="video/webm"
                                loop={true}
                            />
                        </div>
                        <h1 className="text-center font-semibold text-5xl text-pepper-200 leading-none">
                            DROP-FARMER
                        </h1>
                        <p className="text-center text-pepper-200/60 text-xl font-medium leading-none mb-2 -mt-2">
                            Stream drops farmer application
                        </p>
                        <Navigation />
                        <div className="flex flex-col items-center">
                            <p className="w-fit text-pepper-200/60 text-center">
                                Version: {appVersion}
                            </p>
                            <p className="w-fit text-pepper-200/60 text-center">
                                Copyright © Soryn
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
