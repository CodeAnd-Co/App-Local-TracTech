// Configurar la ruta base global ANTES de los mocks
global.rutaBase = `${__dirname}`.replace(/\\/g, '/').split('src/')[0];

const { JSDOM } = require('jsdom');

// Mock de las dependencias
jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: false, isDenied: false })
}));

// Usar jest.doMock para mocks que dependen de rutaBase
jest.doMock(`${global.rutaBase}src/backend/data/analisisModelos/elementoReporte.js`, () => ({
  ElementoNuevo: class {
    constructor(tarjeta, previsualizacion) {
      this.tarjeta = tarjeta;
      this.previsualizacion = previsualizacion;
    }
  },
  Contenedores: class {
    constructor(contenedorTarjeta, contenedorPrevisualizacion) {
      this.contenedorTarjeta = contenedorTarjeta;
      this.contenedorPrevisualizacion = contenedorPrevisualizacion;
    }
  }
}));

const { agregarTexto } = require(`${global.rutaBase}src/framework/utils/scripts/paginas/analisis/agregarTexto.js`);

describe('agregarTexto', () => {
  let dom;
  let document;
  let window;
  let contenedor;
  let previsualizacion;

  beforeEach(() => {
    // Configurar JSDOM
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="contenedorElementos"></div>
          <div id="contenedor-elementos-previsualizacion"></div>
        </body>
      </html>
    `);
    
    document = dom.window.document;
    window = dom.window;
    
    // Configurar globals
    global.document = document;
    global.window = window;
    global.HTMLElement = window.HTMLElement;
    global.HTMLDivElement = window.HTMLDivElement;
    global.HTMLTextAreaElement = window.HTMLTextAreaElement;
    global.HTMLSelectElement = window.HTMLSelectElement;
    global.MutationObserver = window.MutationObserver;
    
    contenedor = document.getElementById('contenedorElementos');
    previsualizacion = document.getElementById('contenedor-elementos-previsualizacion');
  });

  afterEach(() => {
    dom.window.close();
  });

  test('Agregar cuadro de texto correctamente', () => {
    // Ejecutar
    const tarjetaTexto = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');

    // Verificar que se creó la tarjeta de texto
    expect(tarjetaTexto).toBeDefined();
    expect(tarjetaTexto.classList.contains('tarjeta-texto')).toBe(true);
    expect(tarjetaTexto.id).toBe('1');

    // Verificar que se agregó al contenedor
    expect(contenedor.children.length).toBe(1);
    expect(contenedor.children[0]).toBe(tarjetaTexto);

    // Verificar que se creó la previsualización
    expect(previsualizacion.children.length).toBe(1);
    expect(previsualizacion.children[0].classList.contains('previsualizacion-texto')).toBe(true);
    expect(previsualizacion.children[0].id).toBe('previsualizacion-texto-1');

    // Verificar elementos de la interfaz
    expect(tarjetaTexto.querySelector('.tipo-texto')).toBeDefined();
    expect(tarjetaTexto.querySelector('.area-escritura')).toBeDefined();
    expect(tarjetaTexto.querySelector('.eliminar')).toBeDefined();
    expect(tarjetaTexto.querySelector('.alinear')).toBeDefined();

    // Verificar que el área de texto tiene el atributo maxlength
    const areaEscritura = tarjetaTexto.querySelector('.area-escritura');
    expect(areaEscritura.getAttribute('maxlength')).toBe('1000');
  });

  test('Modificar texto de cuadro de texto', () => {
    // Preparar
    const tarjetaTexto = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const areaEscritura = tarjetaTexto.querySelector('.area-escritura');
    const vistaPrevia = previsualizacion.children[0];
    const textoNuevo = 'Este es mi nuevo texto de prueba';

    // Ejecutar
    areaEscritura.value = textoNuevo;
    areaEscritura.dispatchEvent(new window.Event('input'));

    // Verificar que el texto se actualizó en la vista previa
    const parrafoEnPrevia = vistaPrevia.querySelector('p');
    expect(parrafoEnPrevia).toBeDefined();
    expect(parrafoEnPrevia.textContent).toBe(textoNuevo);

    // Verificar que se muestra el contador de caracteres
    const contador = tarjetaTexto.querySelector('.contador-caracteres');
    expect(contador).toBeDefined();
    expect(contador.textContent).toBe(`${textoNuevo.length}/1000 caracteres`);
  });

  test('Modificar tipo de texto (título, subtítulo, contenido)', () => {
    // Preparar
    const tarjetaTexto = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const selectorTipo = tarjetaTexto.querySelector('.tipo-texto');
    const vistaPrevia = previsualizacion.children[0];

    // Verificar estado inicial (título)
    expect(vistaPrevia.classList.contains('preview-titulo')).toBe(true);

    // Cambiar a subtítulo
    selectorTipo.value = 'subtitulo';
    selectorTipo.dispatchEvent(new window.Event('change'));

    // Verificar que cambió la clase
    expect(vistaPrevia.classList.contains('preview-titulo')).toBe(false);
    expect(vistaPrevia.classList.contains('preview-subtitulo')).toBe(true);

    // Cambiar a contenido
    selectorTipo.value = 'contenido';
    selectorTipo.dispatchEvent(new window.Event('change'));

    // Verificar que cambió la clase
    expect(vistaPrevia.classList.contains('preview-subtitulo')).toBe(false);
    expect(vistaPrevia.classList.contains('preview-contenido')).toBe(true);
  });

  test('Verificar límite de 1000 caracteres por cuadro de texto', () => {
    // Preparar
    const tarjetaTexto = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const areaEscritura = tarjetaTexto.querySelector('.area-escritura');

    // Crear texto de exactamente 1000 caracteres
    const texto1000 = 'a'.repeat(1000);
    
    // Ejecutar
    areaEscritura.value = texto1000;
    areaEscritura.dispatchEvent(new window.Event('input'));

    // Verificar contador con texto de 1000 caracteres
    let contador = tarjetaTexto.querySelector('.contador-caracteres');
    expect(contador.textContent).toBe('1000/1000 caracteres');

    // Crear texto de 950 caracteres para verificar color normal
    const texto950 = 'a'.repeat(950);
    areaEscritura.value = texto950;
    areaEscritura.dispatchEvent(new window.Event('input'));

    contador = tarjetaTexto.querySelector('.contador-caracteres');
    expect(contador.textContent).toBe('950/1000 caracteres');
    expect(contador.style.color).toBe('rgb(127, 140, 141)'); // Color normal

    // Crear texto de 970 caracteres para verificar color de advertencia
    const texto970 = 'a'.repeat(970);
    areaEscritura.value = texto970;
    areaEscritura.dispatchEvent(new window.Event('input'));

    contador = tarjetaTexto.querySelector('.contador-caracteres');
    expect(contador.textContent).toBe('970/1000 caracteres');
    expect(contador.style.color).toBe('rgb(231, 76, 60)'); // Color de advertencia

    // Verificar que el maxlength previene más de 1000 caracteres
    expect(areaEscritura.getAttribute('maxlength')).toBe('1000');
  });


  test('Eliminar cuadro de texto', () => {
    // Preparar
    const tarjetaTexto = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const botonEliminar = tarjetaTexto.querySelector('.eliminar');

    // Verificar estado inicial
    expect(contenedor.children.length).toBe(1);
    expect(previsualizacion.children.length).toBe(1);

    // Ejecutar
    botonEliminar.click();

    // Verificar que se eliminó la tarjeta del contenedor
    expect(contenedor.children.length).toBe(0);

    // Verificar que se eliminó la previsualización
    expect(previsualizacion.children.length).toBe(0);

    // Verificar que la tarjeta ya no tiene padre (fue removida del DOM)
    expect(tarjetaTexto.parentNode).toBeNull();
  });

  test('Crear múltiples cuadros de texto', () => {
    // Ejecutar - crear tres cuadros de texto
    const texto1 = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const texto2 = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const texto3 = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');

    // Verificar que tienen IDs secuenciales
    expect(texto1.id).toBe('1');
    expect(texto2.id).toBe('2');
    expect(texto3.id).toBe('3');

    // Verificar que todos están en el contenedor
    expect(contenedor.children.length).toBe(3);
    expect(previsualizacion.children.length).toBe(3);

    // Verificar las previsualizaciones tienen IDs correctos
    expect(previsualizacion.children[0].id).toBe('previsualizacion-texto-1');
    expect(previsualizacion.children[1].id).toBe('previsualizacion-texto-2');
    expect(previsualizacion.children[2].id).toBe('previsualizacion-texto-3');
  });

  test('Manejar texto con saltos de línea', () => {
    // Preparar
    const tarjetaTexto = agregarTexto('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const areaEscritura = tarjetaTexto.querySelector('.area-escritura');
    const vistaPrevia = previsualizacion.children[0];
    const textoConSaltos = 'Primera línea\nSegunda línea\nTercera línea';

    // Ejecutar
    areaEscritura.value = textoConSaltos;
    areaEscritura.dispatchEvent(new window.Event('input'));

    // Verificar que se crearon múltiples párrafos
    const parrafos = vistaPrevia.querySelectorAll('p');
    expect(parrafos.length).toBe(3);
    expect(parrafos[0].textContent).toBe('Primera línea');
    expect(parrafos[1].textContent).toBe('Segunda línea');
    expect(parrafos[2].textContent).toBe('Tercera línea');
  });
});