// RF44 Usuario carga Excel a la plataforma - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF44
// RF45 Usuario elimina el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF45
// RF46 Usuario sustituye el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF46

/* eslint-disable no-undef */

const { mostrarAlerta, mostrarAlertaBorrado } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { borrarExcel } = require(`${rutaBase}/src/backend/casosUso/excel/borrarExcel.js`);
const { leerExcel } = require(`${rutaBase}/src/backend/casosUso/excel/cargarExcel.js`);


inicializarBotones();

/**
 * Inicializa los botones principales en la página de inicio.
 * Esta función configura los eventos y comportamientos para:
 * - El botón de cargar archivos
 * - El botón de borrar archivos o datos seleccionados
 * - El botón para acceder a la sección de tractores
 * @returns {void}
 */
function inicializarBotones() {
    botonCargar();
    botonBorrar();
    botonTractores();
    configurarZonaParaSoltar();
}

/**
 * Inicializa la funcionalidad del botón de borrar Excel.
 * Configura el evento click para eliminar el archivo Excel cargado
 * y actualizar el estado de los botones relacionados.
 * @returns {void}
 */
function botonBorrar() {
    setTimeout(() => {
        const botonAnalisis = document.querySelector('.avanzar-analisis');
        const botonBorrar = document.getElementById('boton-borrar');
        const entradaArchivos = document.querySelectorAll('.cargar-excel');

        botonBorrar.addEventListener('click', async () => {
            // Modal de confirmación para eliminar el archivo
            const resultado = await mostrarAlertaBorrado('No podrás recuperar el archivo eliminado.', 'Eliminar', 'Cancelar');
            if (resultado) {
                mostrarAlerta('Eliminado', 'El archivo ha sido eliminado.', 'success');
                borrarExcel();
                localStorage.setItem('modulo-analisis-habilitado', 'false');
                if (window.desocultarBotonAnalisis) {
                    window.desocultarBotonAnalisis();
                }
                botonAnalisis.setAttribute('disabled', 'true');
                botonBorrar.style.display = 'none';

                // Reiniciar el valor del input de archivos para que se pueda volver a seleccionar el mismo archivo
                if (entradaArchivos) {
                    entradaArchivos.forEach(entradaArchivo => {
                        entradaArchivo.value = '';
                    });

                }
            }
        });
    }, 100);
}

/**
 * Inicializa la funcionalidad del botón de carga de archivos Excel.
 * Configura el evento change del input file para procesar el archivo
 * seleccionado y actualizar la interfaz de usuario.
 * @returns {void}
 */
function botonCargar() {
    setTimeout(() => {
        const entradaArchivos = document.querySelectorAll('.cargar-excel');
        const elementoNombreArchivo = document.querySelector('.texto-archivo');
        const botonAnalisis = document.querySelector('.avanzar-analisis');
        const botonBorrar = document.getElementById('boton-borrar');

        const elementoBotonCargar = document.querySelector('.texto-cargar');


        if (!entradaArchivos || !elementoNombreArchivo) {
            return ('No se encontraron los elementos necesarios');
        }
        
        if (localStorage.getItem('nombreArchivoExcel')) {
            // Si ya hay un archivo seleccionado, lo mostramos
            elementoNombreArchivo.textContent = localStorage.getItem('nombreArchivoExcel');
            elementoBotonCargar.textContent = "Cambiar Archivo"
            // Habilitar el botón de borrar
            botonBorrar.style.display = 'block';
            // Habilitar el botón de análisis
            botonAnalisis.removeAttribute('disabled');
        }

        // Eliminar cualquier dato de sección activa al cargar el módulo inicio
        localStorage.removeItem('seccion-activa');

        entradaArchivos.forEach(entradaArchivo => {
            // Cambia el texto al hacer click en el input file
            entradaArchivo.addEventListener('click', () => {
                elementoBotonCargar.textContent = "Cargando Archivo";
                
                // Detectar cuando la ventana recupera el foco (el diálogo se cerró)
                const manejarFoco = () => {
                    // Dar un pequeño delay para asegurar que el evento change se procese primero
                    setTimeout(() => {
                        // Si el texto sigue siendo "Cargando Archivo", significa que no se seleccionó nada
                        if (elementoBotonCargar.textContent === "Cargando Archivo") {
                            elementoBotonCargar.textContent = localStorage.getItem('nombreArchivoExcel') ? "Cambiar Archivo" : "Cargar Archivo";
                        }
                    }, 100);
                    // Remover el listener después de usarlo
                    window.removeEventListener('focus', manejarFoco);
                };
                
                window.addEventListener('focus', manejarFoco);
            });

            entradaArchivo.addEventListener('change', async () => {
            if (entradaArchivo.files && entradaArchivo.files[0]) {
                const archivo = entradaArchivo.files[0];

                // Texto mientras se procesa
                elementoNombreArchivo.textContent = 'Verificando archivo...';

                try {
                    const resultado = await leerExcel(archivo);

                    if (resultado.exito) {
                        elementoNombreArchivo.textContent = archivo.name;
                        elementoBotonCargar.textContent = "Cambiar Archivo"
                        botonAnalisis.removeAttribute('disabled');
                        botonBorrar.style.display = 'block';
                        localStorage.setItem('nombreArchivoExcel', archivo.name);
                        entradaArchivos.forEach(input => input.value = '');
                    } else {
                        elementoNombreArchivo.textContent = 'Sin archivo seleccionado';
                        elementoBotonCargar.textContent = "Cargar Archivo"
                        botonBorrar.style.display = 'none';
                        botonAnalisis.setAttribute('disabled', 'true');
                        localStorage.removeItem('nombreArchivoExcel');
                        localStorage.removeItem('datosExcel');
                        mostrarAlerta('Archivo no válido', resultado.mensaje, 'error', 'Entendido');
                        entradaArchivo.value = '';
                    }
                } catch (error) {
                    elementoNombreArchivo.textContent = 'Sin archivo seleccionado';
                    elementoBotonCargar.textContent = "Cargar Archivo"
                    botonAnalisis.setAttribute('disabled', 'true');
                    localStorage.removeItem('nombreArchivoExcel');
                    localStorage.removeItem('datosExcel');
                    mostrarAlerta('Error al procesar archivo', error.mensaje || 'Ha ocurrido un error al procesar el archivo.', 'error');
                    entradaArchivo.value = '';
                }
            }
        });
        });
    }, 100);
}

/**
 * Inicializa la funcionalidad del botón de tractores.
 * Configura el evento click para navegar al módulo de tractores cuando
 * se ha cargado un archivo Excel correctamente.
 * @returns {void}
 */
function botonTractores() {
    const botonTractores = document.querySelector('.avanzar-analisis');
    botonTractores.addEventListener('click', async () => {
        const rutaTractores = `${rutaBase}src/framework/vistas/paginas/analisis/seleccionarTractor.ejs`;
        try {
            var vista = await ipcRenderer.invoke('precargar-ejs', rutaTractores, { Seccion: 'Tractores', Icono : 'Casa', permisos});
            window.location.href = vista;
            localStorage.setItem('seccion-activa', 'inicio');
        } catch (err) {
            return ('Error al cargar vista:', err);
        }
    })
}

/**
 * Configura la zona para arrastrar y soltar archivos Excel.
 *
 * Busca el contenedor con la clase 'zona-para-soltar' y, si existe:
 *  - Previene el comportamiento predeterminado de arrastrar y soltar.
 *  - Agrega o quita un estilo visual cuando se arrastra un archivo sobre la zona.
 *  - Procesa el archivo .xlsx soltado: lo valida con leerExcel(), actualiza la interfaz
 *    (muestra nombre, habilita botones, guarda en localStorage) o muestra alertas de error.
 *
 * @returns {void}
 */
function configurarZonaParaSoltar() {
    // Seleccionamos el elemento que actuará como zona de soltado
    const zonaParaSoltar = document.querySelector('.zona-para-soltar');
    const elementoNombreArchivo = document.querySelector('.texto-archivo');
    const botonAnalisis = document.querySelector('.avanzar-analisis');
    const botonBorrar = document.getElementById('boton-borrar');

    if (!zonaParaSoltar) return;

    // Prevenimos el comportamiento por defecto para drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(tipoDeEvento => {
        zonaParaSoltar.addEventListener(tipoDeEvento, evento => evento.preventDefault());
        zonaParaSoltar.addEventListener(tipoDeEvento, evento => evento.stopPropagation());
    });

    // Aplicar un efecto visual a la zona
    zonaParaSoltar.addEventListener('dragover', () => {
        zonaParaSoltar.classList.add('zona-para-soltar--resaltada');
    });

    // Quitar el efecto si el usuario sale de la zona
    zonaParaSoltar.addEventListener('dragleave', () => {
        zonaParaSoltar.classList.remove('zona-para-soltar--resaltada');
    });

    // Procesar el archivo
    zonaParaSoltar.addEventListener('drop', async evento => {
        zonaParaSoltar.classList.remove('zona-para-soltar--resaltada');
        const archivos = evento.dataTransfer.files;
        if (!archivos || archivos.length === 0) return;

        // Prevenir que se procesen múltiples archivos
        if (archivos.length > 1) {
            mostrarAlerta('Solo se permite un archivo', 'Por favor, suelta un solo archivo Excel a la vez.', 'error');
            return;
        }

        // Escoger el primer archivo .xlsx
        const archivo = Array.from(archivos).find(archivo => archivo.name.endsWith('.xlsx'));
        if (!archivo) {
            mostrarAlerta('Formato no válido', 'Solo se aceptan archivos .xlsx', 'error');
            return;
        }

        // Retroalimentación visual del procesamiento
        elementoNombreArchivo.textContent = 'Verificando archivo...';

        try {
            const resultado = await leerExcel(archivo);

            if (resultado.exito) {
                elementoNombreArchivo.textContent = archivo.name;
                botonAnalisis.removeAttribute('disabled');
                botonBorrar.style.display = 'block';
                localStorage.setItem('nombreArchivoExcel', archivo.name);
                // Limpiar cualquier otra entrada
                document.querySelectorAll('.cargar-excel').forEach(input => input.value = '');
            } else {
                elementoNombreArchivo.textContent = 'Sin archivo seleccionado';
                botonBorrar.style.display = 'none';
                botonAnalisis.setAttribute('disabled', 'true');
                localStorage.removeItem('nombreArchivoExcel');
                localStorage.removeItem('datosExcel');
                mostrarAlerta('Archivo no válido', resultado.mensaje, 'error', 'Entendido');
            }
        } catch (error) {
            elementoNombreArchivo.textContent = 'Sin archivo seleccionado';
            botonAnalisis.setAttribute('disabled', 'true');
            localStorage.removeItem('nombreArchivoExcel');
            localStorage.removeItem('datosExcel');
            mostrarAlerta('Error al procesar archivo', error.mensaje || 'Ha ocurrido un error al procesar el archivo.', 'error');
        }
    });
}
