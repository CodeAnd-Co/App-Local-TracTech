// Importar funciones de elementos de reporte
import { agregarTexto } from './agregarTexto.js';
import { agregarGrafica } from './agregarGrafica.js';

// Función para inicializar el módulo de análisis
function inicializarModuloAnalisis() {
    
    // Actualizar el sidebar visualmente sin modificar localStorage
    const todosBotones = document.querySelectorAll('.boton-sidebar');
    todosBotones.forEach(boton => boton.classList.remove('activo'));
    
    const botonesAnalisis = document.querySelectorAll('.boton-sidebar[data-seccion="analisis"]');
    botonesAnalisis.forEach(boton => boton.classList.add('activo'));
    
    // Actualizar el topbar si está disponible
    if (window.actualizarTopbar) {
        window.actualizarTopbar('analisis');
    }
    
    // Configurar botones para añadir elementos a reporte
    const contenedor = 'contenedorElementos';
    document.getElementById('agregarTexto').addEventListener('click', () => {
      console.log("Texto")
      agregarTexto(contenedor);
    });

    document.getElementById('agregarGrafica').addEventListener('click', () => {
      console.log("Gráfica")
      agregarGrafica(contenedor)
    })
  
    // Cargar los datos del Excel desde localStorage
    const datosExcel = cargarDatosExcel();
    console.log("Datos de Excel:", datosExcel);
    
    // Si tienes datos, puedes inicializar tu visualización aquí
    if (!datosExcel) {
        console.warn("No hay datos disponibles para análisis");
    }
}

// Carga los datos del Excel desde localStorage
function cargarDatosExcel() {
    try {
        // Verificar si hay datos disponibles
        const hayDatos = localStorage.getItem('datosExcelDisponibles');
        
        if (!hayDatos || hayDatos !== 'true') {
            console.warn("No hay datos de Excel disponibles");
            return null;
        }
        
        // Recuperar los datos de Excel
        const datosExcelJSON = localStorage.getItem('datosExcel');
        
        if (!datosExcelJSON) {
            console.warn("No se encontraron datos de Excel en localStorage");
            return null;
        }
        
        // Parsear los datos JSON
        const datosExcel = JSON.parse(datosExcelJSON);
        
        // Guardar en variable global para fácil acceso desde otras funciones
        window.datosExcelGlobal = datosExcel;
        
        return datosExcel;
    } catch (error) {
        console.error("Error al cargar datos de Excel:", error);
        return null;
    }
}



// Ejecutar inicialización si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarModuloAnalisis);
} else {
    // DOM ya está cargado
    setTimeout(inicializarModuloAnalisis, 100);
}

// Exportar funciones para uso global
window.inicializarModuloAnalisis = inicializarModuloAnalisis;
window.cargarDatosExcel = cargarDatosExcel;