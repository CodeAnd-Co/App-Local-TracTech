// Mock de rutaBase para las pruebas
global.rutaBase = '';

// Mock de localStorage para las pruebas
global.localStorage = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

// Mock de usuariosAPI para evitar dependencias externas
jest.mock('../../backend/domain/usuariosAPI/usuariosAPI', () => ({
    obtenerDispositivos: jest.fn(),
    habilitarDispositivo: jest.fn()
}));

const { obtenerDispositivos } = require('../../backend/casosUso/dispositivos/obtenerDispositivos');
const { habilitarDispositivo } = require('../../backend/casosUso/dispositivos/habilitarDispositivo');

/**
 * Pruebas para la funcionalidad de gestión de dispositivos
 */
describe('Gestión de Dispositivos', () => {
    const usuariosAPIMock = require('../../backend/domain/usuariosAPI/usuariosAPI');
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('obtenerDispositivos', () => {
        test('debería obtener la lista de dispositivos exitosamente', async () => {
            // Mock de respuesta exitosa
            usuariosAPIMock.obtenerDispositivos.mockResolvedValueOnce({
                ok: true,
                dispositivos: [
                    { id: 'DEVICE-001', nombrePropietario: 'Juan Pérez', estado: true },
                    { id: 'DEVICE-002', nombrePropietario: 'María García', estado: false }
                ]
            });
            
            const resultado = await obtenerDispositivos();
            
            expect(resultado).toHaveProperty('ok', true);
            expect(resultado).toHaveProperty('dispositivos');
            expect(Array.isArray(resultado.dispositivos)).toBe(true);
            expect(resultado.dispositivos).toHaveLength(2);
        });

        test('debería manejar errores de conexión apropiadamente', async () => {
            // Mock de error de conexión
            usuariosAPIMock.obtenerDispositivos.mockRejectedValueOnce(new Error('Error de conexión'));
            
            const resultado = await obtenerDispositivos();
            
            expect(resultado.ok).toBe(false);
            expect(resultado.mensaje).toContain('Error al obtener la lista de dispositivos');
        });
    });    describe('habilitarDispositivo', () => {
        test('debería habilitar un dispositivo exitosamente', async () => {
            const idDispositivo = 'TEST-DEVICE-001';
            
            // Mock de la API que simula éxito
            usuariosAPIMock.habilitarDispositivo.mockResolvedValueOnce({
                ok: true,
                mensaje: 'Dispositivo habilitado correctamente'
            });
            
            const resultado = await habilitarDispositivo(idDispositivo);
            
            expect(resultado.ok).toBe(true);
            expect(resultado.mensaje).toContain('habilitado');
        });

        test('debería rechazar ID de dispositivo vacío', async () => {
            const resultado = await habilitarDispositivo('');
            
            expect(resultado.ok).toBe(false);
            expect(resultado.mensaje).toBe('ID de dispositivo no proporcionado');
        });

        test('debería rechazar ID de dispositivo nulo', async () => {
            const resultado = await habilitarDispositivo(null);
            
            expect(resultado.ok).toBe(false);
            expect(resultado.mensaje).toBe('ID de dispositivo no proporcionado');
        });

        test('debería manejar errores de la API apropiadamente', async () => {
            const idDispositivo = 'TEST-DEVICE-002';
            
            // Mock de la API que simula error
            usuariosAPIMock.habilitarDispositivo.mockRejectedValueOnce(new Error('Error de servidor'));
            
            const resultado = await habilitarDispositivo(idDispositivo);
            
            expect(resultado.ok).toBe(false);
            expect(resultado.mensaje).toContain('Error al habilitar el dispositivo');
        });
    });
});
