import clsx from 'clsx';
import React, { useState } from 'react';

interface Props {
    tabs: {
        title: string;
        desc: string;
        content: JSX.Element;
    }[];
    onLastTab: (isOnLastTab: boolean) => void;
}

export default function TabSwitcher({ tabs, onLastTab }: Props) {
    const [currentTab, setCurrentTab] = useState<string>(tabs[0].title);

    return (
        <div className="h-full w-full flex flex-col">
            <ul className="flex flex-row gap-2 items-center justify-center w-fit self-center px-2 pt-2 bg-pepper-500 rounded-t-md">
                {tabs.map((tab, index) => {
                    return (
                        <li
                            key={tab.title}
                            onClick={() => {
                                setCurrentTab(tab.title);

                                if (index === tabs.length - 1) {
                                    onLastTab(true);
                                } else {
                                    onLastTab(false);
                                }
                            }}
                            className={clsx(
                                'px-3 py-0.5 rounded text-snow-300 cursor-pointer',
                                {
                                    'bg-pepper-700 hover:bg-pepper-800 ':
                                        tab.title !== currentTab,
                                    'bg-pepper-900': tab.title === currentTab
                                }
                            )}
                        >
                            {tab.title}
                        </li>
                    );
                })}
            </ul>

            <div className="h-full flex flex-row gap-4 rounded-lg p-4 bg-pepper-500">
                <div className="w-3/4 overflow-y-auto">
                    {tabs.find((tab) => tab.title === currentTab)?.content}
                </div>

                <p className="h-full rounded-md p-2 bg-pepper-700/30 text-snow-300">
                    {tabs.find((tab) => tab.title === currentTab)?.desc}
                </p>
            </div>
        </div>
    );
}
