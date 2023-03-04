import { IpcChannels } from '@main/common/constants';
import { handleAndReply, handleOneWay } from '@main/electron/ipc';
import { setAppQuitting } from '@main/electron/windows';
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
