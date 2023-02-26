import clsx from 'clsx';
import React, { useState } from 'react';

interface Props {
    tabs: {
        title: string;
        desc?: string | JSX.Element;
        content: JSX.Element;
    }[];
    onLastTab?: (isOnLastTab: boolean) => void;
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

                                if (onLastTab) {
                                    if (index === tabs.length - 1) {
                                        onLastTab(true);
                                    } else {
                                        onLastTab(false);
                                    }
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

            {tabs.map((tab) => {
                if (tab.title === currentTab) {
                    return (
                        <div
                            className="h-full flex flex-row gap-4 rounded-lg p-4 bg-pepper-500"
                            key={tab.title}
                        >
                            <div
                                className={clsx('overflow-y-auto', {
                                    '!w-3/5': tab.desc,
                                    'w-full': !tab.desc
                                })}
                            >
                                {tab.content}
                            </div>

                            {tab.desc && (
                                <p className="w-2/5 h-full rounded-md p-2 bg-pepper-700/30 text-snow-300">
                                    {tab.desc}
                                </p>
                            )}
                        </div>
                    );
                }
            })}
        </div>
    );
}
