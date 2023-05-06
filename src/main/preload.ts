import { contextBridge } from 'electron';
import { API } from '../api';

contextBridge.exposeInMainWorld('api', API);
