import { API } from '@exposed/api';
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', API);
