const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');
const {precargarEJS} = require('./framework/utils/scripts/middleware/precargarEJS')
const { verificarEstado } = require('./backend/servicios/verificarEstado');
const { obtenerID } = require('./backend/servicios/generadorID');
const { PERMISOS } = require('./framework/utils/scripts/middleware/auth');

// Comprobar si la aplicación se está ejecutando en modo de instalación de Squirrel
// y salir si es así. Esto es necesario para evitar que la aplicación se inicie
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = async () => {
  // Crear la ventana del navegador.
  mainWindow = new BrowserWindow({
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
    await mainWindow.loadFile(vista);
  } catch  {
    return ('Error al cargar la pantalla de carga', 'No se pudo cargar la pantalla de carga.', 'error');
  }


  // Poner la ventana en modo de pantalla completa.
  mainWindow.maximize();

  iniciarVerificacionPeriodica();
  // Abrir las herramientas de desarrollo.
  // mainWindow.webContents.openDevTools();
};

// Este método se llamará cuando Electron haya terminado de inicializar
// y esté listo para crear ventanas del navegador.

function iniciarVerificacionPeriodica() {
    // Verificar cada 2 minutos
    const verificacionIntervalo = setInterval(async () => {
        await verificarYManejarEstado();
    }, 2 * 60 * 1000);

    // Verificación inicial
    setTimeout(verificarYManejarEstado, 15000); // 15 segundos después del inicio
    
    // Guardar el intervalo para poder limpiarlo si es necesario
    app.verificacionIntervalo = verificacionIntervalo;
}

/**
 * Verifica el estado y maneja la deshabilitación si es necesario
 */
async function verificarYManejarEstado() {
    const token = await obtenerTokenAlmacenado();
    const dispositivoId = obtenerID();
    
    if (!token) {
        return;
    }
    
    // Verificar si el usuario es superadministrador
    const permisos = await obtenerPermisosAlmacenados();
    const esSuperAdmin = permisos.includes(PERMISOS.SUPERADMIN);
    
    if (esSuperAdmin) {
        return;
    }
    
    try {
        const verificacion = await verificarEstado(token, dispositivoId);
        if (!verificacion.estado) {
            deshabilitarAplicacion('Aplicación deshabilitada por seguridad');
        }
    } catch {
        return ('Error de conexión', 'No se pudo verificar el estado de la aplicación. Por favor, inténtalo de nuevo más tarde.', 'error');
    }
}

/**
 * Deshabilita la aplicación mostrando una pantalla de bloqueo
 */
async function deshabilitarAplicacion(mensaje) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        try {
            // Limpiar el intervalo de verificación
            if (app.verificacionIntervalo) {
                clearInterval(app.verificacionIntervalo);
            }
            
            // Cargar pantalla de bloqueo
            const pantallaBloqueoPath = path.join(__dirname, './framework/vistas/paginas/inicio/pantallaBloqueo.ejs');
            
            const vista = await precargarEJS(pantallaBloqueoPath, { mensaje });
            await mainWindow.loadFile(vista);
            
            // Deshabilitar navegación
            mainWindow.webContents.removeAllListeners('will-navigate');
            mainWindow.webContents.on('will-navigate', (event) => {
                event.preventDefault();
            });
            
            // Deshabilitar nuevas ventanas
            mainWindow.webContents.setWindowOpenHandler(() => {
                return { action: 'deny' };
            });
            
            // Limpiar datos sensibles
            await limpiarDatosSensibles();
            
        } catch  {
            app.quit();
        }
    }
}

/**
 * Limpia datos sensibles del localStorage y archivos temporales
 */
async function limpiarDatosSensibles() {
    if (mainWindow && mainWindow.webContents && !mainWindow.isDestroyed()) {
        try {
            await mainWindow.webContents.executeJavaScript(`
                localStorage.clear();
            `);
        } catch (error) {

            console.error('Error al limpiar datos sensibles:', error);
        }
    }
}

/**
 * Obtiene el token almacenado
 */
async function obtenerTokenAlmacenado() {
    if (mainWindow && mainWindow.webContents && !mainWindow.isDestroyed()) {
        try {
            return await mainWindow.webContents.executeJavaScript('localStorage.getItem("token")');
        } catch (error) {
            console.error('Error al obtener token:', error);
            return null;
        }
    }
    return null;
}

/**
 * Obtiene los permisos del usuario almacenados en localStorage
 */
async function obtenerPermisosAlmacenados() {
    if (mainWindow && mainWindow.webContents && !mainWindow.isDestroyed()) {
        try {
            const permisos = await mainWindow.webContents.executeJavaScript('localStorage.getItem("permisos")');
            return permisos ? JSON.parse(permisos) : [];
        } catch (error) {
            console.error('Error al obtener permisos:', error);
            return [];
        }
    }
    return [];
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Cerrar la aplicación cuando todas las ventanas estén cerradas
// Esto es necesario para evitar que la aplicación se cierre en macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Manejar la apertura del diálogo de selección de archivos cuando se descarga un pdf
ipcMain.on('guardar-pdf', async (evento, bufer) => {
  const resultado = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar PDF',
    defaultPath: 'reporte.pdf',
    filters: [
      { name: 'PDF', extensions: ['pdf'] }
    ]
  });

  if (!resultado.canceled) {
    fs.writeFileSync(resultado.filePath, bufer);
  }
    
  evento.sender.send('pdf-guardado', !resultado.canceled);
});

ipcMain.handle('precargar-ejs', async (event, rutaEJS, parametros) => {
  return await precargarEJS(rutaEJS, parametros);
});

// IPC para verificación manual de estado
ipcMain.handle('verificar-estado-aplicacion', async () => {
    const token = await obtenerTokenAlmacenado();
    const dispositivoId = obtenerID();
    
    if (!token) return { estado: false, mensaje: 'No hay token válido' };
    
    try {
        return await verificarEstado(token, dispositivoId);
    } catch  {
        return { estado: false, mensaje: 'Error de conexión' };
    }
});

// IPC para obtener el ID del dispositivo
ipcMain.handle('obtener-dispositivo-id', () => {
    return obtenerID();
});