const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');
const {precargarEJS} = require('./framework/utils/scripts/middleware/precargarEJS')

// Comprobar si la aplicación se está ejecutando en modo de instalación de Squirrel
// y salir si es así. Esto es necesario para evitar que la aplicación se inicie
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
  // Crear la ventana del navegador.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Desactivar el aislamiento de contexto para permitir el uso de Node.js en el frontend
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Cargar el archivo ejs de pantalla de carga
  // mainWindow.loadFile(path.join(__dirname, './framework/vistas/pantallaCarga.html'));

  const pantallaCargaPath = path.join(__dirname, './framework/vistas/paginas/pantallaCarga.ejs');

  try {
    const vista = await precargarEJS(pantallaCargaPath);
    console.log("Vista cargada:", vista);
    await mainWindow.loadFile(vista);
  } catch (err) {
    console.error("Error al cargar vista:", err);
  }


  // Poner la ventana en modo de pantalla completa.
  mainWindow.maximize();

  // Abrir las herramientas de desarrollo.
  // mainWindow.webContents.openDevTools();
};

// Este método se llamará cuando Electron haya terminado de inicializar
// y esté listo para crear ventanas del navegador.

app.whenReady().then(() => {
  createWindow();

  // Cerrar la ventana principal cuando se cierra la última ventana.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Cerrar la aplicación cuando todas las ventanas estén cerradas
// Esto es necesario para evitar que la aplicación se cierre en macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar la apertura del diálogo de selección de archivos cuando se descarga un pdf
ipcMain.on('guardar-pdf', async (evento, bufer) => {
  const { canceled: cancelado, filePath: ubicacion } = await dialog.showSaveDialog({
    title: 'Guardar PDF',
    defaultPath: 'reporte.pdf',
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (!cancelado && ubicacion) {
    fs.writeFile(ubicacion, bufer, (error) => {
      if (error) {
        console.error('Error al guardar PDF:', error);
      } else {
        console.log('PDF guardado en', ubicacion);
      }
    });
  }

  evento.sender.send('pdf-guardado', !cancelado);
});

ipcMain.handle('read-user-data', async (event, fileName) => {
  const path = electron.app.getPath('userData');
  const buf = await fs.promises.readFile(`${path}/${fileName}`);
  return buf;
});