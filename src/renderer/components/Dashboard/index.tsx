import Model from '@components/global/Model';
import Navigation from '@components/global/Navigation';
import React from 'react';
import Sidebar from './Sidebar';

/**
 * The route for the main page of the application.
 */
export default function Dashboard() {
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
                        </div>
                        <Navigation />
                    </div>
                </div>
            </div>
        </>
    );
}
