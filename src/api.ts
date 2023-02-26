import { IpcChannel, IpcChannels, Selections } from '@main/common/constants';
import {
    capitalize,
    capitalizeFirstLetter,
    removeTypeFromText
} from '@main/common/string.helper';
import { ipcRenderer, IpcRendererEvent } from 'electron';

export default {
    channels: IpcChannels,
    selections: Selections,
    removeTypeFromText: (text: string) => removeTypeFromText(text),
    capitalizeFirstLetter: (text: string) => capitalizeFirstLetter(text),
    capitalize: (text: string) => capitalize(text),
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
