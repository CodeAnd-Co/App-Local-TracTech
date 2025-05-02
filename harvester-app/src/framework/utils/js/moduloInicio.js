// RF44 Usuario carga Excel a la plataforma - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF44
// RF45 Usuario elimina el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF45
// RF46 Usuario sustituye el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF46

const Swal = require('sweetalert2');
const { borrarExcel } = require('../../backend/casosUso/excel/borrarExcel.js');
const { leerExcel } = require('../../backend/casosUso/excel/cargarExcel.js');

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
    const permisos = localStorage.getItem('permisos'); 
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
 * Inicializa la funcionalidad del botón de análisis.
 * Configura el evento click para navegar al módulo de análisis cuando
 * se ha cargado un archivo Excel correctamente.
 * @returns {void}
 */
function botonAnalisis() {
    setTimeout(() => {
        const botonAnalisis = document.querySelector('.avanzar-analisis');

        if (localStorage.getItem('nombreArchivoExcel')) {
            // Habilitar el botón de analisis
            botonAnalisis.removeAttribute('disabled');
        }
        
        if (botonAnalisis) {
            botonAnalisis.addEventListener('click', () => {
                // Esperar un momento para que se procesen los datos antes de cambiar de módulo
                setTimeout(() => {
                    // Buscar todos los botones del sidebar con data-seccion='analisis' 
                    // y marcarlos como activos
                    const botonesAnalisis = document.querySelectorAll('.boton-sidebar[data-seccion="analisis"]');
                    const todosBotones = document.querySelectorAll('.boton-sidebar');
                    
                    // Quitar activo de todos los botones
                    todosBotones.forEach(boton => boton.classList.remove('activo'));
                    
                    // Marcar como activos los botones de análisis
                    botonesAnalisis.forEach(boton => boton.classList.add('activo'));
                    
                    // Actualizar topbar directamente
                    if (window.actualizarTopbar) {
                        window.actualizarTopbar('analisis');
                    }
                    
                    // Cargar el módulo de análisis
                    const ventanaPrincipal = document.getElementById('ventana-principal');
                    if (ventanaPrincipal) {
                        fetch('../vistas/moduloAnalisis.html')
                            .then(res => res.text())
                            .then(html => {
                                ventanaPrincipal.innerHTML = html;
                                // Si el script de análisis ya está cargado, inicializarlo
                                if (window.cargarDatosExcel) {
                                    window.cargarDatosExcel();
                                }
                            })
                            .catch(err => console.error('Error cargando módulo de análisis:', err));
                    }
                }, 500); // Esperar 500ms para asegurar que los datos se guarden correctamente
            });
        }
    }, 100);
}

// Exponer las funciones al objeto window para que puedan ser utilizadas por otros módulos
window.botonBorrar = botonBorrar;
window.botonCargar = botonCargar;
window.botonAnalisis = botonAnalisis;