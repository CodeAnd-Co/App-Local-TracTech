/**
 * Configura el cambio de nombre del archivo cuando se selecciona uno
 */
function cambiarNombreArchivo() {
    // Esperamos a que el DOM esté completamente cargado
    setTimeout(() => {
        const entradaArchivo = document.querySelector('.cargar-input');
        const elementoNombreArchivo = document.querySelector('.texto-archivo');
        const botonAnalisis = document.querySelector('.avanzar-analisis');
        
        if (!entradaArchivo || !elementoNombreArchivo) {
            return console.error("No se encontraron los elementos necesarios");
        }
        
        // Eliminar cualquier dato de sección activa al cargar el módulo inicio
        localStorage.removeItem('seccion-activa');
        
        // Usamos un solo método para manejar el cambio
        function manejarCambioArchivo() {
            if (entradaArchivo.files && entradaArchivo.files.length > 0) {
                elementoNombreArchivo.textContent = entradaArchivo.files[0].name;
                botonAnalisis.removeAttribute('disabled');
                localStorage.setItem('nombreArchivoExcel', entradaArchivo.files[0].name);
            } else {
                elementoNombreArchivo.textContent = 'Sin Archivo Seleccionado';
            }
        }
        
        // Solo usamos addEventListener, no también onchange
        entradaArchivo.addEventListener('change', manejarCambioArchivo);
        
    }, 100);
}

function configurarBotonAnalisis() {
    setTimeout(() => {
        const botonAnalisis = document.querySelector('.avanzar-analisis');
        const entradaArchivo = document.querySelector('.cargar-input');
        
        if (botonAnalisis && entradaArchivo) {
            botonAnalisis.addEventListener('click', () => {
                if (entradaArchivo.files && entradaArchivo.files.length > 0) {
                    const archivo = entradaArchivo.files[0];
                    
                    // Guardar el nombre del archivo para usarlo en el módulo de análisis
                    localStorage.setItem('nombreArchivoExcel', archivo.name);
                    
                    // Leer el archivo Excel
                    leerArchivoExcel(archivo);
                    
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
                }
            });
        }
    }, 100);
}

function leerArchivoExcel(archivo) {
    // Mostramos indicador de carga si quieres
    const elementoNombreArchivo = document.querySelector('.texto-archivo');
    if (elementoNombreArchivo) {
        elementoNombreArchivo.textContent = 'Leyendo archivo...';
    }
    
    const lector = new FileReader();
    lector.onload = function(evento) {
        try {
            const datos = new Uint8Array(evento.target.result);
            const libro = XLSX.read(datos, { type: 'array' });
            
            // Procesamos todas las hojas del Excel
            const todasLasHojas = {};
            
            // Recorremos cada nombre de hoja en el libro
            libro.SheetNames.forEach(nombreHoja => {
                // Obtenemos la hoja por su nombre
                const hoja = libro.Sheets[nombreHoja];
                // Convertimos la hoja a JSON
                const datosHojaJSON = XLSX.utils.sheet_to_json(hoja, { header: 1 });
                // Almacenamos los datos usando el nombre de la hoja como clave
                todasLasHojas[nombreHoja] = datosHojaJSON;
            });
            
            // Incluimos metadatos útiles
            const datosCompletos = {
                nombreArchivo: archivo.name,
                hojas: todasLasHojas,
            };
            
            // Guardar los datos en localStorage con la nueva estructura
            localStorage.setItem('datosExcel', JSON.stringify(datosCompletos));
            
            // También guardar un indicador de que hay datos disponibles
            localStorage.setItem('datosExcelDisponibles', 'true');
            
            if (elementoNombreArchivo) {
                elementoNombreArchivo.textContent = archivo.name;
            }

        } catch (error) {
            console.error("Error al leer el archivo Excel:", error);
            alert("Error al procesar el archivo Excel. Verifica que sea un archivo válido.");
            
            if (elementoNombreArchivo) {
                elementoNombreArchivo.textContent = 'Error al leer el archivo';
            }
        }
    };
    
    lector.onerror = function() {
        console.error("Error al leer el archivo");
        alert("Error al leer el archivo. Inténtalo de nuevo.");
        
        if (elementoNombreArchivo) {
            elementoNombreArchivo.textContent = 'Error al leer el archivo';
        }
    };
    
    // Iniciamos la lectura del archivo
    lector.readAsArrayBuffer(archivo);
}

// Verificar si el DOM ya está cargado, si no, esperar a que cargue
if (document.readyState === 'loading') {
    function onDOMContentLoaded() {
        cambiarNombreArchivo();
        configurarBotonAnalisis();
    }
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
} else {
    // El DOM ya está cargado
    cambiarNombreArchivo();
    configurarBotonAnalisis();
}

// Inicializar la aplicación siempre en el módulo inicio
function establecerSeccionActiva() {
    // Establecer 'inicio' como la sección activa al cargar la página
    localStorage.setItem('seccion-activa', 'inicio');
}

window.addEventListener('load', establecerSeccionActiva);

window.cambiarNombreArchivo = cambiarNombreArchivo;
window.configurarBotonAnalisis = configurarBotonAnalisis;