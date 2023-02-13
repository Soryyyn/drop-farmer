import clsx from 'clsx';
import React, { useState } from 'react';

interface Props {
    tabs: {
        title: string;
        content: JSX.Element;
    }[];
}

export function TabSwitcher({ tabs }: Props) {
    const [currentTab, setCurrentTab] = useState<string>(tabs[0].title);

    return (
        <div className="h-full w-full flex flex-col">
            <ul className="flex flex-row gap-2 items-center justify-center w-fit self-center px-2 pt-2 bg-pepper-500 rounded-t-md">
                {tabs.map((tab) => {
                    return (
                        <li
                            key={tab.title}
                            onClick={() => {
                                setCurrentTab(tab.title);
                            }}
                            className={clsx(
                                'px-2 py-0.5 rounded text-snow-300 cursor-pointer',
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

            <div className="h-full rounded-lg p-4 bg-pepper-500">
                {tabs.find((tab) => tab.title === currentTab)?.content}
            </div>
        </div>
    );
}
