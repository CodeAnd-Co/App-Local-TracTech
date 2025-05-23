// RF44 Usuario carga Excel a la plataforma - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF44
// RF45 Usuario elimina el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF45
// RF46 Usuario sustituye el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF46

/* eslint-disable no-undef */

const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);
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
        const entradaArchivo = document.querySelector('.cargar-excel');

        botonBorrar.addEventListener('click', () => {
            // Modal de confirmación para eliminar el archivo
            Swal.fire({
                title: '¿Estás seguro?',
                text: 'No podrás recuperar el archivo eliminado.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#1F4281',
                cancelButtonColor: '#A61930',
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar'
              }).then((result) => {
                if (result.isConfirmed) {
                  Swal.fire({
                    title: 'Eliminado',
                    text: 'El archivo ha sido eliminado.',
                    icon: 'success',
                    confirmButtonColor: '#1F4281',
                  });
                  borrarExcel();
                  botonAnalisis.setAttribute('disabled', 'true');
                  botonBorrar.style.display = 'none';

                // Reiniciar el valor del input de archivos para que se pueda volver a seleccionar el mismo archivo
                if (entradaArchivo) {
                    entradaArchivo.value = '';
                    }
                }
              });
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
    console.log("cargando archivo")
    setTimeout(() => {
        const entradaArchivo = document.querySelector('.cargar-excel');
        const elementoNombreArchivo = document.querySelector('.texto-archivo');
        const botonAnalisis = document.querySelector('.avanzar-analisis');
        const botonBorrar = document.getElementById('boton-borrar');

        if (!entradaArchivo || !elementoNombreArchivo) {
            return console.error('No se encontraron los elementos necesarios');
        }
        
        if (localStorage.getItem('nombreArchivoExcel')) {
            // Si ya hay un archivo seleccionado, lo mostramos
            elementoNombreArchivo.textContent = localStorage.getItem('nombreArchivoExcel');
            // Habilitar el botón de borrar
            botonBorrar.style.display = 'block';
            // Habilitar el botón de análisis
            botonAnalisis.removeAttribute('disabled');
        }

        // Eliminar cualquier dato de sección activa al cargar el módulo inicio
        localStorage.removeItem('seccion-activa');

        entradaArchivo.addEventListener('change', async () => {
            if (entradaArchivo.files && entradaArchivo.files[0]) {
                const archivo = entradaArchivo.files[0];
                
                // Cambiar el texto mientras se procesa el archivo
                if (elementoNombreArchivo) {
                    elementoNombreArchivo.textContent = 'Verificando archivo...';
                }
                
                try {
                    // Llamamos a leerExcel que ahora devuelve un objeto con el resultado
                    const resultado = await leerExcel(archivo);
                    
                    if (resultado.exito) {
                        // Si fue exitoso, configuramos la UI
                        elementoNombreArchivo.textContent = archivo.name;
                        botonAnalisis.removeAttribute('disabled');
                        botonBorrar.style.display = 'block';
                    } else {
                        // Si hubo error de validación, mostramos el mensaje
                        elementoNombreArchivo.textContent = 'Sin archivo seleccionado';
                        botonBorrar.style.display = 'none';
                        botonAnalisis.setAttribute('disabled', 'true');
                        botonAnalisis.style.cursor = 'default';
                        localStorage.removeItem('nombreArchivoExcel');
                        localStorage.removeItem('datosExcel');
                        
                        // Mostrar modal con el error de validación
                        Swal.fire({
                            title: 'Archivo no válido',
                            text: resultado.mensaje,
                            icon: 'error',
                            confirmButtonColor: '#1F4281',
                            confirmButtonText: 'Entendido'
                        });
                        
                        // Resetear el input
                        entradaArchivo.value = '';
                    }
                } catch (error) {
                    // En caso de error durante el proceso
                    console.error('Error procesando el archivo:', error);
                    
                    // Actualizar UI
                    elementoNombreArchivo.textContent = 'Sin archivo seleccionado';
                    botonAnalisis.setAttribute('disabled', 'true');
                    localStorage.removeItem('nombreArchivoExcel');
                    localStorage.removeItem('datosExcel');
                    
                    // Mostrar modal con el error
                    Swal.fire({
                        title: 'Error al procesar archivo',
                        text: error.mensaje || 'Ha ocurrido un error al procesar el archivo.',
                        icon: 'error',
                        confirmButtonColor: '#1F4281',
                        confirmButtonText: 'Aceptar'
                    });
                    
                    // Reiniciar el valor del input
                    entradaArchivo.value = '';
                }
            }
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
            var vista = await ipcRenderer.invoke('precargar-ejs', rutaTractores, { Seccion: 'Tractores', Icono : 'Casa'});
            window.location.href = vista;
            localStorage.setItem('seccion-activa', 'inicio');
        } catch (err) {
            console.error('Error al cargar vista:', err);
        }
    })
}
