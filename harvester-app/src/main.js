const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');
const ejs = require('ejs');
const http = require('http');
const express = require('express');


const expressApp = express();

const PORT = 4850

// Configurar vistas con EJS
expressApp.set('view engine', 'ejs');
expressApp.set('views', path.join(__dirname, 'framework/vistas'));

// Middleware para archivos estáticos (CSS, JS, imágenes)
expressApp.use('/utils', express.static(path.join(__dirname, 'framework/utils')));

expressApp.use(function (req, res, next) {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// Rutas
expressApp.get('/pantallaCarga', (req, res) => {
  res.render('pantallaCarga.ejs', {
    basePath: `file://${__dirname}` // si usas rutas absolutas para assets
  });
});

// Iniciar servidor
const server = http.createServer(expressApp);
server.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});


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
      nodeIntegration: true,
      contextIsolation: false, // Desactivar el aislamiento de contexto para permitir el uso de Node.js en el frontend
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Cargar el archivo HTML de inicio de sesión.
  // mainWindow.loadFile(path.join(__dirname, './framework/vistas/pantallaCarga.html'));

  mainWindow.loadURL(`http://localhost:${PORT}/pantallaCarga`);

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