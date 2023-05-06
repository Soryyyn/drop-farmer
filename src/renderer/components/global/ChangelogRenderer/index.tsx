import { useSendAndWait } from '@renderer/hooks/useSendAndWait';
import React, { useState } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export default function ChangelogRenderer() {
    const [changelog, setChangelog] = useState('');

    useSendAndWait({
        channel: window.api.channels.getChangelog,
        callback: (err, changelogString) => {
            if (!err) setChangelog(changelogString);
        }
    });

    return (
        <ReactMarkdown
            components={{
                h2: ({ node, ...props }) => (
                    <h2
                        className="text-snow-500 text-xl font-medium"
                        {...props}
                    />
                ),
                h3: ({ node, ...props }) => (
                    <h3
                        className="text-snow-500/80 text-lg mt-2.5 font-medium"
                        {...props}
                    />
                ),
                ul: ({ node, ...props }) => (
                    <ul
                        className="text-snow-500/60 list-disc list-inside"
                        {...props}
                    />
                ),
                li: ({ node, ...props }) => (
                    <li className="text-snow-500/60" {...props} />
                )
            }}
        >
            {changelog}
        </ReactMarkdown>
    );
}
