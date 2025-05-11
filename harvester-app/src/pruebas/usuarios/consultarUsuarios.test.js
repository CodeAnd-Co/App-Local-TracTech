/**
 * @file pruebas/usuarios/obtenerUsuarios.test.js
 * @description
 * Pruebas unitarias del caso de uso `obtenerUsuarios`, que se encarga de
 * obtener una lista de usuarios desde la API y mapearla a una instancia
 * de `ListaUsuarios` que contiene objetos `Usuario`.
 * 
 * Se prueban los siguientes escenarios:
 * - Caso exitoso con múltiples usuarios.
 * - Caso exitoso pero con lista vacía.
 * - Fallo controlado cuando `ok: false` en la respuesta.
 * - Error en la red u otra excepción al llamar la API.
 * 
 * @see https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40
 * 
 * @module pruebas/usuarios/obtenerUsuarios.test
 * @see módulo {@link ../../backend/casosUso/usuarios/consultarUsuarios}
 * @see clase {@link ../../backend/data/usuariosModelos/usuarios~Usuario}
 * @see clase {@link ../../backend/data/usuariosModelos/usuarios~ListaUsuarios}
 */



/*  2. ───── Importaciones ──────────────────────────────────────────────── */
const {
  obtenerUsuarios: obtenerUsuariosAPIPrueba
} = require('../../backend/domain/usuariosAPI/usuariosAPI');

const { obtenerUsuarios } = require('../../backend/casosUso/usuarios/consultarUsuarios');

const { Usuario, ListaUsuarios } = require('../../backend/data/usuariosModelos/usuarios');

/*  1. ───── Mock del módulo que llama al fetch ──────────────────────────── */
jest.mock('../../backend/domain/usuariosAPI/usuariosAPI', () => ({
  obtenerUsuarios: jest.fn()
}));

/*  3. ───── Tests ──────────────────────────────────────────────────────── */
describe('obtenerUsuarios (use-case)', () => {
  let espiaDeError;

  // Suprime errores en consola durante las pruebas que los provocan
  beforeAll(() => {
    espiaDeError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterAll(() => {
    espiaDeError.mockRestore();
  });

  beforeEach(() => jest.clearAllMocks());

  /**
   * Escenario exitoso: se reciben usuarios y se devuelve una instancia
   * de ListaUsuarios con objetos Usuario correctamente construidos.
   */
  it('devuelve ListaUsuarios con objetos Usuario (camino feliz)', async () => {
    const respuestaPrueba = {
      ok: true,
      usuarios: [
        { id: 1, nombre: 'Juan', correo: 'juan@example.com' },
        { id: 2, nombre: 'Ana',  correo: 'ana@example.com' }
      ]
    };
    obtenerUsuariosAPIPrueba.mockResolvedValue(respuestaPrueba);

    const lista = await obtenerUsuarios();

    expect(lista).toBeInstanceOf(ListaUsuarios);

    const usuarios = lista.obtenerUsuarios();
    expect(usuarios.length).toBe(2);
    expect(usuarios[0]).toBeInstanceOf(Usuario);
    expect(usuarios[0]).toMatchObject({
      id: 1,
      nombre: 'Juan',
      correo: 'juan@example.com'
    });
  });

  /**
   * Escenario exitoso: respuesta ok, pero sin usuarios.
   * Se espera una ListaUsuarios vacía.
   */
  it('devuelve ListaUsuarios vacía si la API no trae usuarios', async () => {
    obtenerUsuariosAPIPrueba.mockResolvedValue({ ok: true, usuarios: [] });

    const lista = await obtenerUsuarios();

    expect(lista).toBeInstanceOf(ListaUsuarios);
    expect(lista.obtenerUsuarios().length).toBe(0);
  });

  /**
   * Error controlado: respuesta con ok: false. 
   * El caso de uso debe lanzar una excepción con mensaje descriptivo.
   */
  it('lanza error cuando la API responde ok = false', async () => {
    obtenerUsuariosAPIPrueba.mockResolvedValue({ ok: false });

    await expect(obtenerUsuarios())
      .rejects.toThrow('No se pudo obtener la lista de usuarios');
  });

  /**
   * Error técnico: la API rechaza la promesa (por ejemplo, fallo de red).
   * El caso de uso debe capturar el error y lanzar una excepción clara.
   */
  it('lanza error cuando la API rechaza la promesa', async () => {
    obtenerUsuariosAPIPrueba.mockRejectedValue(new Error('Network error'));

    await expect(obtenerUsuarios())
      .rejects.toThrow('No se pudo obtener la lista de usuarios');
  });
});
