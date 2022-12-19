import Model from '@components/global/Model';
import Navigation from '@components/global/Navigation';
import Tooltip from '@components/global/Tooltip';
import { SettingsContext } from '@util/contexts';
import React, { useContext, useEffect, useState } from 'react';
import ModalManager from '../ModalManager';
import Sidebar from '../Sidebar';

/**
 * The route for the main page of the application.
 */
export default function Home() {
    const [applicationVersion, setApplicationVersion] =
        useState<string>('0.0.0');

    /**
     * On site load, get internet connection
     */
    useEffect(() => {
        window.api.log('DEBUG', 'Rendering home page');

        /**
         * Application version.
         */
        window.api
            .sendAndWait(window.api.channels.getApplicationVersion)
            .then((version: any) => {
                setApplicationVersion(version);
            })
            .catch((err) => {
                window.api.log(
                    'ERROR',
                    `Error when setting application version. ${err}`
                );
            });

        return () => {
            window.api.removeAllListeners(
                window.api.channels.getApplicationVersion
            );
        };
    }, []);

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
                        <h1 className="text-center font-bold text-5xl text-pepper-200">
                            DROP-FARMER
                        </h1>
                        <p className="text-center text-pepper-200 text-xl">
                            Stream drops farmer application
                        </p>
                        <Navigation />
                        <div className="flex flex-col items-center">
                            <p className="w-fit text-pepper-200/60 text-center">
                                Version: {applicationVersion}
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
