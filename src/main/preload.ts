import { contextBridge } from 'electron';
import { API } from './exposed/api';

contextBridge.exposeInMainWorld('api', API);
