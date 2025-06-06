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



 /*  1. ───── Importaciones ──────────────────────────────────────────────── */
 const {
  obtenerUsuarios: obtenerUsuariosAPIPrueba
} = require('../../backend/domain/usuariosAPI/usuariosAPI');

const { obtenerUsuarios } = require('../../backend/casosUso/usuarios/consultarUsuarios');

const { Usuario, ListaUsuarios } = require('../../backend/data/usuariosModelos/usuarios');

/*  2. ───── Mock del módulo que llama al fetch ──────────────────────────── */
jest.mock('../../backend/domain/usuariosAPI/usuariosAPI', () => ({
  obtenerUsuarios: jest.fn()
}));

/*  3. ───── Tests ──────────────────────────────────────────────────────── */
describe('obtenerUsuarios (caso de uso)', () => {
  let monitorDeError;

  // Suprime errores en consola durante las pruebas que los provocan
  beforeAll(() => {
    monitorDeError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterAll(() => {
    monitorDeError.mockRestore();
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
        { idUsuario: 1, Nombre: 'Juan', Correo: 'juan@example.com', TieneDispositivo: false, DispositivoId: null, DispositivoActivo: false },
        { idUsuario: 2, Nombre: 'Ana',  Correo: 'ana@example.com',  TieneDispositivo: true, DispositivoId: 5, DispositivoActivo: true }
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
      correo: 'juan@example.com',
      tieneDispositivo: false,
      dispositivoId: null,
      dispositivoActivo: false
    });

    expect(usuarios[1]).toBeInstanceOf(Usuario);
    expect(usuarios[1]).toMatchObject({
      id: 2,
      nombre: 'Ana',
      correo: 'ana@example.com',
      tieneDispositivo: true,
      dispositivoId: 5,
      dispositivoActivo: true
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
   * El caso de uso debe lanzar una excepción con mensaje descrito en la respuesta.
   */
  it('lanza error cuando la API responde ok = false', async () => {
    // Si no se envía `mensaje`, el código arroja 'Error al obtener la lista de usuarios del servidor'
    obtenerUsuariosAPIPrueba.mockResolvedValue({ ok: false });

    await expect(obtenerUsuarios())
      .rejects.toThrow('Error al obtener la lista de usuarios del servidor');
  });

  it('lanza error con el mensaje recibido si la API responde ok = false y trae mensaje', async () => {
    const msgError = 'Error interno del servidor';
    obtenerUsuariosAPIPrueba.mockResolvedValue({ ok: false, mensaje: msgError });

    await expect(obtenerUsuarios())
      .rejects.toThrow(msgError);
  });

  /**
   * Error técnico: la API rechaza la promesa (por ejemplo, fallo de red).
   * El caso de uso debe capturar el error y lanzar la misma excepción (Network error).
   */
  it('lanza error cuando la API rechaza la promesa', async () => {
    const errorRed = new Error('Network error');
    obtenerUsuariosAPIPrueba.mockRejectedValue(errorRed);

    await expect(obtenerUsuarios())
      .rejects.toThrow('Network error');
  });
});
