// Datos de prueba para dispositivos - Temporal para testing
const dispositivosDePrueba = [
    {
        idDispositivo: "DEVICE-001-WIN-LAPTOP",
        nombrePropietario: "Juan Pérez",
        activo: true,
        ultimoAcceso: "2025-06-22 10:30:00"
    },
    {
        idDispositivo: "DEVICE-002-MAC-DESKTOP", 
        nombrePropietario: "María García",
        activo: false,
        ultimoAcceso: "2025-06-20 15:45:00"
    },
    {
        idDispositivo: "DEVICE-003-LINUX-SERVER",
        nombrePropietario: "Carlos López",
        activo: true,
        ultimoAcceso: "2025-06-22 09:15:00"
    },
    {
        idDispositivo: "DEVICE-004-WIN-TABLET",
        nombrePropietario: null,
        activo: false,
        ultimoAcceso: null
    }
];

/**
 * Función temporal para retornar datos de prueba
 * Reemplaza temporalmente la llamada a la API
 */
function obtenerDispositivosDePrueba() {
    return {
        ok: true,
        dispositivos: dispositivosDePrueba
    };
}

module.exports = {
    obtenerDispositivosDePrueba,
    dispositivosDePrueba
};
