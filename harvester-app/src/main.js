const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');
const {precargarEJS} = require('./framework/utils/scripts/middleware/precargarEJS')
const { verificarEstado } = require('./backend/servicios/verificarEstado');
const { obtenerID } = require('./backend/servicios/generadorID');
const { PERMISOS } = require('./framework/utils/scripts/middleware/auth');
const os = require('os');

const INTERVALOTIEMPO = 120000; // 2 minutos en milisegundos

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
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
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
};


function iniciarVerificacionPeriodica() {
    // Limpiar cualquier verificación existente antes de crear una nueva
    if (app.verificacionIntervalo) {
        clearInterval(app.verificacionIntervalo);
    }
    
    // Verificar cada 2 minutos solo para usuarios autenticados
    const verificacionIntervalo = setInterval(async () => {
        await verificarEstadoUsuarioAutenticado();
    }, INTERVALOTIEMPO);

    // Verificación inicial después de 15 segundos
    setTimeout(verificarEstadoUsuarioAutenticado, 15000);
    
    // Guardar el intervalo para poder limpiarlo si es necesario
    app.verificacionIntervalo = verificacionIntervalo;
}

/**
 * Verifica el estado solo para usuarios autenticados
 */
async function verificarEstadoUsuarioAutenticado() {
    const token = await obtenerTokenAlmacenado();
    
    // Solo verificar si hay token (usuario autenticado)
    if (!token) {
        // Si no hay token, detener la verificación periódica
        if (app.verificacionIntervalo) {
            clearInterval(app.verificacionIntervalo);
            app.verificacionIntervalo = null;
        }
        return;
    }
    
    const dispositivoId = obtenerID();
    
    // Verificar si el usuario es superadministrador
    const permisos = await obtenerPermisosAlmacenados();
    const esSuperAdmin = permisos.includes(PERMISOS.SUPERADMIN);
    
    if (esSuperAdmin) {
        return;
    }
    
    try {
        const verificacion = await verificarEstado(token, dispositivoId);
        if (!verificacion.estado) {
            // Manejar diferentes tipos de error
            let mensaje = 'Aplicación deshabilitada por seguridad';
            
            if (verificacion.codigo === 'DISPOSITIVO_AJENO') {
                mensaje = 'Este dispositivo pertenece a otro usuario';
            } else if (verificacion.codigo === 'MULTIPLES_DISPOSITIVOS') {
                mensaje = 'Múltiples dispositivos detectados en tu cuenta';
            }
            
            deshabilitarAplicacion(mensaje);
        }
    } catch {
        return ('Error de conexión al verificar estado');
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
        } catch  {
            return   
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
        } catch  {
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
        } catch  {
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
ipcMain.on('guardar-pdf', async (event, buffer) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Guardar reporte PDF',
    defaultPath: path.join(os.homedir(), 'Downloads', 'reporte.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (canceled) {
    event.reply('pdf-guardado', false);
    return;
  }
  try {
    fs.writeFileSync(filePath, buffer);
    event.reply('pdf-guardado', true);
  } catch {
    event.reply('pdf-guardado', false); // <-- Elimina 'error' del catch
  }
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


// IPC para reiniciar verificación periódica después del login
ipcMain.handle('reiniciar-verificacion-periodica', () => {
    iniciarVerificacionPeriodica();
    return { ok: true };
});