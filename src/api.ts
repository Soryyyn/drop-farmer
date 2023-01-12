import { removeTypeFromText } from '@main/common/stringManipulation';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcChannels } from './main/common/constants';

export default {
    channels: IpcChannels,
    removeTypeFromText: (text: string) => removeTypeFromText(text),
    sendOneWay: (channel: IpcChannels, ...args: any[]) =>
        ipcRenderer.send(channel, ...args),
    sendAndWait: (channel: IpcChannels, ...args: any[]) =>
        ipcRenderer.invoke(channel, ...args),
    handleOneWay: (
        channel: IpcChannels,
        listener: (event: IpcRendererEvent, ...args: any[]) => void
    ) => ipcRenderer.on(channel, listener),
    removeAllListeners: (channel: IpcChannels) =>
        ipcRenderer.removeAllListeners(channel)
};
