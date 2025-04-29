// RF44 Usuario carga Excel a la plataforma - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF44
// RF45 Usuario elimina el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF45
// RF46 Usuario sustituye el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF46

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
        botonBorrar.addEventListener('click', () => {
            borrarExcel();
            botonAnalisis.setAttribute('disabled', 'true');
            botonBorrar.style.display = 'none';
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

        entradaArchivo.addEventListener('change', () => {
            leerExcel(entradaArchivo.files[0]);
            botonAnalisis.removeAttribute('disabled');
            botonBorrar.style.display = 'block';
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
    setTimeout(() => {
        const botonTractores = document.querySelector('.avanzar-analisis');

        if (localStorage.getItem('nombreArchivoExcel')) {
            // Habilitar el botón de analisis
            botonTractores.removeAttribute('disabled');
        }
        
        if (botonTractores) {
            botonTractores.addEventListener('click', () => {
                // Esperar un momento para que se procesen los datos antes de cambiar de módulo
                setTimeout(() => {
                    // Actualizar topbar directamente
                    if (window.actualizarTopbar) {
                        window.actualizarTopbar('tractores');
                    }
                    
                    // Cargar el módulo de tractores
                    const ventanaPrincipal = document.getElementById('ventana-principal');
                    if (ventanaPrincipal) {
                        fetch('../vistas/moduloTractores.html')
                            .then(res => res.text())
                            .then(html => {
                                ventanaPrincipal.innerHTML = html;
                                // Si el script de análisis ya está cargado, inicializarlo
                                if (window.inicializarModuloTractores) {
                                    window.inicializarModuloTractores();
                                }
                            })
                            .catch(err => console.error("Error cargando módulo de tractores:", err));
                    }
                }, 500); // Esperar 500ms para asegurar que los datos se guarden correctamente
            });
        }
    }, 100);
}

// Exponer las funciones al objeto window para que puedan ser utilizadas por otros módulos
window.botonBorrar = botonBorrar;
window.botonCargar = botonCargar;
window.botonTractores = botonTractores;