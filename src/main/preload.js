const { contextBridge } = require('electron');
import api from '../api';

contextBridge.exposeInMainWorld('api', api);
