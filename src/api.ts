import {
    capitalizeFirstLetter,
    removeTypeFromText
} from '@main/common/stringManipulation';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcChannel, IpcChannels } from './main/common/constants';

export default {
    channels: IpcChannels,
    removeTypeFromText: (text: string) => removeTypeFromText(text),
    capitalize: (text: string) => capitalizeFirstLetter(text),
    sendOneWay: (channel: IpcChannel, ...args: any[]) =>
        ipcRenderer.send(channel, ...args),
    sendAndWait: (channel: IpcChannel, ...args: any[]) =>
        ipcRenderer.invoke(channel, ...args),
    handleOneWay: (
        channel: IpcChannel,
        listener: (event: IpcRendererEvent, ...args: any[]) => void
    ) => ipcRenderer.on(channel, listener),
    removeAllListeners: (channel: IpcChannel) =>
        ipcRenderer.removeAllListeners(channel)
};
