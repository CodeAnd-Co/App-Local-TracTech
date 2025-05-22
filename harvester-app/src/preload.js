const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('modulosAPI', {
  cambiarVista: (vista) => ipcRenderer.send('cambiar-vista', vista)
});
