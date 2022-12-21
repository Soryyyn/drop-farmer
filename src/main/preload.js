const { contextBridge } = require('electron');
import api from '../api';
// import { Channels } from './common/channels';

/**
 * Expose functionality from main to renderer process.
 *
 * Use the the context bridge via "window.api" and then the exposed methods / objects.
 * Ex. window.api.callMain()
 */
contextBridge.exposeInMainWorld('api', api);
