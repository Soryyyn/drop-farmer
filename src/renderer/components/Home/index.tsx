import Model from '@components/global/Model';
import Navigation from '@components/global/Navigation';
import React from 'react';
import AboutButton from './AboutButton';
import Sidebar from './Sidebar';

/**
 * The route for the main page of the application.
 */
export default function Home() {
    return (
        <>
            <div className="flex flex-row h-full gap-8">
                <Sidebar />
                <div className="relative flex grow justify-center items-center !min-w-[60%]">
                    <div className="flex flex-col gap-3">
                        <div className="w-2/3 self-center -mb-5">
                            <Model
                                src="../assets/crate-falling.webm"
                                type="video/webm"
                                loop={true}
                            />
                        </div>
                        <h1 className="text-center font-semibold text-5xl text-pepper-200 leading-none">
                            DROP FARMER
                        </h1>
                        <p className="text-center text-pepper-200/60 text-xl font-medium leading-none mb-2 -mt-2">
                            Stream drops farmer application
                        </p>
                        <Navigation />
                        <div className="absolute bottom-0 right-8">
                            <AboutButton />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
