// RF44 Usuario carga Excel a la plataforma - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF44
// RF45 Usuario elimina el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF45
// RF46 Usuario sustituye el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF46

const { borrarExcel }  = require('../../backend/casosUso/excel/borrarExcel.js');
const { leerExcel } = require('../../backend/casosUso/excel/cargarExcel.js');

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

function botonCargar() {
    setTimeout(() => {
        const entradaArchivo = document.querySelector('.cargar-excel');
        const elementoNombreArchivo = document.querySelector('.texto-archivo');
        const botonAnalisis = document.querySelector('.avanzar-analisis');
        const botonBorrar = document.getElementById('boton-borrar');

        if (!entradaArchivo || !elementoNombreArchivo) {
            return console.error("No se encontraron los elementos necesarios");
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
                    // Buscar todos los botones del sidebar con data-seccion="analisis" 
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
                                if (window.inicializarModuloAnalisis) {
                                    window.inicializarModuloAnalisis();
                                }
                            })
                            .catch(err => console.error("Error cargando módulo de análisis:", err));
                    }
                }, 500); // Esperar 500ms para asegurar que los datos se guarden correctamente
            });
        }
    }, 100);
}

window.botonBorrar = botonBorrar;
window.botonCargar = botonCargar;
window.botonAnalisis = botonAnalisis;