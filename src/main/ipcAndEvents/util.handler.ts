import { EventChannels, IpcChannels } from '@main/common/constants';
import { handleAndReply, handleOneWay } from '@main/electron/ipc';
import { setAppQuitting } from '@main/electron/windows';
import { listenForEvent } from '@main/util/events';
import { disconnectPuppeteer } from '@main/util/puppeteer';
import { log } from 'console';
import { app, shell } from 'electron';

handleOneWay(IpcChannels.openLinkInExternal, (event, link: string) => {
    shell.openExternal(link);
});

handleOneWay(IpcChannels.shutdown, () => {
    setAppQuitting(true);
    app.quit();
});

handleAndReply(IpcChannels.getApplicationVersion, () => {
    return app.getVersion();
});

listenForEvent(EventChannels.PCWentToSleep, async () => {
    log('warn', 'Disconnecting puppeteer connection');

    disconnectPuppeteer();
});
