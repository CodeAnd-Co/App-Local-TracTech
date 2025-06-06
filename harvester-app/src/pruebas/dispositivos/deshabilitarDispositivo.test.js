/**
 * @file pruebas/dispositivos/deshabilitarDispositivo.test.js
 * @description
 * Pruebas unitarias del caso de uso `deshabilitarDispositivo`, que bloquea el dispositivo de un usuario específico.
 * 
 * Escenarios probados:
 * - Deshabilitación exitosa.
 * - Token faltante.
 * - Error de red o excepción de la API.
 */

/* 1. ───── Importaciones ──────────────────────────────────────────────── */
const { deshabilitarDispositivo } = require('../../backend/casosUso/dispositivos/deshabilitarDispositivo');
const { deshabilitarDispositivo: deshabilitarDispositivoAPIMock } = require('../../backend/domain/usuariosAPI/usuariosAPI');

/* 2. ───── Mock del módulo que llama al fetch ──────────────────────────── */
jest.mock('../../backend/domain/usuariosAPI/usuariosAPI', () => ({
    deshabilitarDispositivo: jest.fn(),
}));

/* 3. ───── Tests ──────────────────────────────────────────────────────── */
describe('deshabilitarDispositivo (caso de uso)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deshabilita el dispositivo exitosamente (camino feliz)', async () => {
        const idUsuario = 'abdff123456htgst';
        const respuestaMock = {
            ok: true,
            mensaje: 'Dispositivo deshabilitado correctamente',
        };

        deshabilitarDispositivoAPIMock.mockResolvedValue(respuestaMock);

        const resultado = await deshabilitarDispositivo(idUsuario);

        expect(deshabilitarDispositivoAPIMock).toHaveBeenCalledTimes(1);
        expect(deshabilitarDispositivoAPIMock).toHaveBeenCalledWith(idUsuario);
        expect(resultado).toEqual(respuestaMock);
    });

    it('falla si el token no está presente', async () => {
        const idUsuario = 'abdff123456htgst';
        const respuestaMock = {
            ok: false,
            mensaje: 'Token de autenticación no encontrado',
        };

        deshabilitarDispositivoAPIMock.mockResolvedValue(respuestaMock);

        const resultado = await deshabilitarDispositivo(idUsuario);

        expect(deshabilitarDispositivoAPIMock).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(respuestaMock);
    });

    it('maneja errores de red o excepciones de la API', async () => {
        const idUsuario = 'abdff123456htgst';
        deshabilitarDispositivoAPIMock.mockRejectedValue(new Error('Fallo de red'));

        const resultado = await deshabilitarDispositivo(idUsuario);

        expect(deshabilitarDispositivoAPIMock).toHaveBeenCalledTimes(1);
        expect(deshabilitarDispositivoAPIMock).toHaveBeenCalledWith(idUsuario);
        expect(resultado).toEqual({
            ok: false,
            mensaje: 'Error al deshabilitar el dispositivo',
        });
    });

    it('ID menor a 10 caracteres', async () => {
        const idUsuario = 'abdff1234';
        const respuestaMock = {
            ok: false,
            mensaje: 'Error al deshabilitar el dispositivo',
        };
        const resultado = await deshabilitarDispositivo(idUsuario);

        expect(deshabilitarDispositivoAPIMock).toHaveBeenCalledTimes(1);
        expect(deshabilitarDispositivoAPIMock).toHaveBeenCalledWith(idUsuario);
        expect(resultado).toEqual({
            ok: false,
            mensaje: 'Error al deshabilitar el dispositivo',
        });
    });
});