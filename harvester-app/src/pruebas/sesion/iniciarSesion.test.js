/**
 * @file pruebas/sesion/iniciarSesion.test.js
 * @description
 * Pruebas unitarias del caso de uso `iniciarSesion`, que valida el correo y realiza la autenticación.
 * 
 * Escenarios probados:
 * - Inicio de sesión exitoso.
 * - Correo inválido.
 * - Error de la API.
 * - Contraseña vacía.
 * - Correo vacío.
 */

/*  1. ───── Importaciones ──────────────────────────────────────────────── */
const { iniciarSesion } = require('../../backend/casosUso/sesion/iniciarSesion');
const { iniciarSesion: iniciarSesionAPIMock } = require('../../backend/domain/sesionAPI/sesionAPI');

/*  2. ───── Mock del módulo que llama al fetch ──────────────────────────── */
jest.mock('../../backend/domain/sesionAPI/sesionAPI', () => ({
  iniciarSesion: jest.fn(),
}));

/*  3. ───── Tests ──────────────────────────────────────────────────────── */
describe('iniciarSesion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería iniciar sesión exitosamente con correo y contraseña válidos', async () => {
    const correo = 'correo@dominio.com';
    const contrasenia = '12345678';
    const respuestaMock = { ok: true, mensaje: 'Inicio de sesión exitoso' };

    iniciarSesionAPIMock.mockResolvedValue(respuestaMock);

    const resultado = await iniciarSesion(correo, contrasenia);

    expect(iniciarSesionAPIMock).toHaveBeenCalledTimes(1);
    expect(iniciarSesionAPIMock).toHaveBeenCalledWith(correo, contrasenia);
    expect(resultado).toEqual(respuestaMock);
  });

  it('debería rechazar correos inválidos', async () => {
    const correo = 'correo @dominio.com'; // Correo con espacios
    const contrasenia = '12345678';

    const resultado = await iniciarSesion(correo, contrasenia);

    expect(iniciarSesionAPIMock).not.toHaveBeenCalled(); // No debería llamar a la API
    expect(resultado).toEqual({
      ok: false,
      mensaje: 'Correo inválido',
    });
  });

  it('debería manejar errores de la API', async () => {
    const correo = 'correo@dominio.com';
    const contrasenia = '12345678';

    iniciarSesionAPIMock.mockRejectedValue(new Error('Error de conexión'));

    const resultado = await iniciarSesion(correo, contrasenia);

    expect(iniciarSesionAPIMock).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({
      ok: false,
      mensaje: 'Error al iniciar sesión',
    });
  });

  it('debería rechazar contraseñas vacías', async () => {
    const correo = 'correo@dominio.com';
    const contrasenia = '';

    const resultado = await iniciarSesion(correo, contrasenia);

    expect(iniciarSesionAPIMock).not.toHaveBeenCalled(); // No debería llamar a la API
    expect(resultado).toEqual({
      ok: false,
      mensaje: 'La contraseña no puede estar vacía',
    });
  });

  it('debería rechazar correos vacíos', async () => {
    const correo = '';
    const contrasenia = '12345678';

    const resultado = await iniciarSesion(correo, contrasenia);

    expect(iniciarSesionAPIMock).not.toHaveBeenCalled(); // No debería llamar a la API
    expect(resultado).toEqual({
      ok: false,
      mensaje: 'Correo inválido',
    });
  });
});