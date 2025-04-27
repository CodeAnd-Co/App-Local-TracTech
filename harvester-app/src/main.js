const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// Comprobar si la aplicación se está ejecutando en modo de instalación de Squirrel
// y salir si es así. Esto es necesario para evitar que la aplicación se inicie
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Crear la ventana del navegador.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false, // Desactivar el aislamiento de contexto para permitir el uso de Node.js en el frontend
    },
  });

  // Cargar el archivo HTML de inicio de sesión.
  mainWindow.loadFile(path.join(__dirname, './framework/vistas/Framelayout.html'));

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