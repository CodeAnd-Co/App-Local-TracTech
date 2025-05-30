const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Genera o recupera un ID único para el dispositivo
 * @returns {string} ID único del dispositivo
 */
function obtenerID() {
    const dispositivoIdPath = path.join(os.homedir(), '.harvester_device_id');
    
    // Intentar leer ID existente
    if (fs.existsSync(dispositivoIdPath)) {
        try {
            return fs.readFileSync(dispositivoIdPath, 'utf8').trim();
        } catch (error) {
            return ('Error al leer ID:', error);
        }
    }
    
    // Generar nuevo ID basado en características del sistema
    const systemInfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalmem: os.totalmem(),
        timestamp: Date.now()
    };
    
    const dispositivoId = crypto
        .createHash('sha256')
        .update(JSON.stringify(systemInfo))
        .digest('hex')
        .substring(0, 32);
    
    // Guardar ID para uso futuro
    try {
        fs.writeFileSync(dispositivoIdPath, dispositivoId);
    } catch (error) {
        return ('Error al guardar dispositivo ID:', error);
    }
    
    return dispositivoId;
}

// Exportar ambas funciones para mantener compatibilidad
module.exports = { obtenerID, obtenerId: obtenerID };