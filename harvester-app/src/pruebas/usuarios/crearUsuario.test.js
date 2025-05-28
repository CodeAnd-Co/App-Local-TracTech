/**
 * @file pruebas/usuarios/crearUsuario.test.js
 * @description
 * Pruebas unitarias del caso de uso `crearUsuario`, que valida y sanitiza
 * los datos del nuevo usuario antes de enviarlos a la API.
 * 
 * Escenarios probados:
 * - Creación exitosa del usuario.
 * - Faltan campos obligatorios.
 * - Correo inválido.
 * - Falla técnica al llamar la API.
 * @see https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF39
 */

/*  1. ───── Importaciones ──────────────────────────────────────────────── */
const { crearUsuario } = require('../../backend/casosUso/usuarios/crearUsuario');
const { crearUsuario: crearUsuarioAPIMock } = require('../../backend/domain/usuariosAPI/usuariosAPI');

/*  2. ───── Mock del módulo que llama al fetch ──────────────────────────── */
jest.mock('../../backend/domain/usuariosAPI/usuariosAPI', () => ({
  crearUsuario: jest.fn()
}));

/*  3. ───── Tests ──────────────────────────────────────────────────────── */
describe('crearUsuario (use-case)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea usuario exitosamente (camino feliz)', async () => {
    const datosEntrada = {
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      contrasenia: '12345678',
      idRolFK: 2
    };

    const respuestaMock = {
      mensaje: 'Usuario creado exitosamente',
      id: 123
    };

    crearUsuarioAPIMock.mockResolvedValue(respuestaMock);

    const resultado = await crearUsuario(datosEntrada);

    expect(crearUsuarioAPIMock).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({
      ok: true,
      mensaje: 'Usuario creado exitosamente',
      id: 123
    });
  });

  it('falla si faltan campos requeridos', async () => {
    const datosIncompletos = {
      nombre: '',
      correo: '',
      contrasenia: '',
      idRolFK: null
    };

    const resultado = await crearUsuario(datosIncompletos);

    expect(crearUsuarioAPIMock).not.toHaveBeenCalled();
    expect(resultado).toEqual({
      ok: false,
      mensaje: 'Todos los campos son obligatorios'
    });
  });

  it('falla si el correo no es válido', async () => {
    const datos = {
      nombre: 'Juan',
      correo: 'correo-no-valido',
      contrasenia: '12345678',
      idRolFK: 1
    };

    const resultado = await crearUsuario(datos);

    expect(crearUsuarioAPIMock).not.toHaveBeenCalled();
    expect(resultado).toEqual({
      ok: false,
      mensaje: 'Correo electrónico no válido'
    });
  });

  it('maneja errores de red o excepciones de la API', async () => {
    crearUsuarioAPIMock.mockRejectedValue(new Error('Fallo de red'));

    const datos = {
      nombre: 'Ana',
      correo: 'ana@example.com',
      contrasenia: 'abcdef1234',
      idRolFK: 3
    };

    const resultado = await crearUsuario(datos);

    expect(crearUsuarioAPIMock).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({
      ok: false,
      mensaje: 'Error al crear el usuario'
    });
  });
});
