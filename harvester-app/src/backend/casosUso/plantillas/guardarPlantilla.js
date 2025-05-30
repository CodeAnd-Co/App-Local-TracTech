// Renombrado a guardarPlantillaCasoUso.js para evitar conflictos
const PlantillaReporte       = require('../../data/plantillasModelos/PlantillaReporte');
const GraficaContenido       = require('../../data/plantillasModelos/GraficaContenido');
const TextoContenido         = require('../../data/plantillasModelos/TextoContenido');
const { guardarPlantillaAPI} = require('../../../backend/domain/plantillasAPI/guardarPlantilla');

/**
 * Extrae contenidos del DOM y guarda la plantilla via API
 * IMPORTANTE: Esta función debe ejecutarse en el navegador (frontend)
 *
 * @param {HTMLElement} contenedor - Elemento DOM que contiene las tarjetas
 * @param {string} nombrePlantilla - Nombre dado por el usuario
 * @param {Object} opcionesEnvio - {frecuencia, correo, telefono}
 */
async function guardarPlantillaCasoUso(contenedor, nombrePlantilla, opcionesEnvio = {}) {
  try {
    // Validaciones iniciales
    if (!contenedor) {
      throw new Error('Contenedor no proporcionado');
    }
    
    if (!nombrePlantilla || nombrePlantilla.trim() === '') {
      throw new Error('El nombre de la plantilla es requerido');
    }

    const contenidos = [];
    let ordenGlobal = 1;

    // Extraer gráficas
    const tarjetasGrafica = contenedor.querySelectorAll('.tarjeta-grafica');
    tarjetasGrafica.forEach(node => {
      try {
        const nombre = node.querySelector('.titulo-grafica')?.value?.trim() || '';
        const tipo = node.querySelector('.tipo-grafica')?.value?.trim() || '';
        
        if (!nombre || !tipo) {
          console.warn('Gráfica sin nombre o tipo, omitiendo...');
          return;
        }

        let parametros = {};
        const dataParam = node.getAttribute('data-param');
        if (dataParam) {
          try {
            parametros = JSON.parse(dataParam);
          } catch (e) {
            console.warn('Error parseando parámetros de gráfica:', e);
            parametros = {};
          }
        }

        const grafica = new GraficaContenido({
          ordenContenido: ordenGlobal++,
          nombreGrafica: nombre,
          tipoGrafica: tipo,
          parametros
        });
        
        contenidos.push(grafica);
      } catch (error) {
        console.error('Error procesando gráfica:', error);
      }
    });

    // Extraer textos
    const tarjetasTexto = contenedor.querySelectorAll('.tarjeta-texto');
    tarjetasTexto.forEach(node => {
      try {
        const texto = node.querySelector('textarea')?.value?.trim() || node.textContent?.trim() || '';
        
        if (!texto) {
          console.warn('Texto vacío, omitiendo...');
          return;
        }

        const tipoTexto = node.querySelector('.tipo-texto')?.value || node.getAttribute('data-tipo') || 'Parrafo';
        const alineacion = node.querySelector('.alineacion-texto')?.value || node.getAttribute('data-alineacion') || 'Izquierda';

        const textoContenido = new TextoContenido({
          ordenContenido: ordenGlobal++,
          tipoTexto,
          alineacion,
          contenidoTexto: texto
        });
        
        contenidos.push(textoContenido);
      } catch (error) {
        console.error('Error procesando texto:', error);
      }
    });

    // Validar que hay contenido
    if (contenidos.length === 0) {
      throw new Error('No se encontraron contenidos válidos para guardar');
    }

    // Crear plantilla
    const plantilla = new PlantillaReporte({
      nombrePlantilla,
      contenidos, // Ahora usa 'contenidos' en lugar de 'datos'
      frecuenciaEnvio: Number(opcionesEnvio.frecuencia) || 0,
      correoDestino: opcionesEnvio.correo || '',
      numeroDestino: opcionesEnvio.telefono || ''
    });

    // Validar plantilla
    if (!plantilla.esValida()) {
      throw new Error('La plantilla no es válida');
    }

    // Enviar a API
    const respuesta = await guardarPlantillaAPI(plantilla);
    return respuesta;

  } catch (error) {
    console.error('Error en guardarPlantillaCasoUso:', error);
    throw error;
  }
}

/**
 * Función helper para mostrar notificaciones (requiere SweetAlert2 en el frontend)
 * @param {Object} respuesta - Respuesta de la API
 */
async function mostrarResultadoGuardado(respuesta) {
  // Solo usar si SweetAlert2 está disponible globalmente
  if (typeof Swal !== 'undefined') {
    if (respuesta.ok && respuesta.status === 201) {
      await Swal.fire({
        title: 'Plantilla guardada',
        text: respuesta.mensaje || 'Operación exitosa',
        icon: 'success'
      });
    } else if (respuesta.status === 400) {
      await Swal.fire({
        title: 'Datos inválidos',
        text: respuesta.mensaje || 'Faltan datos o formato erróneo',
        icon: 'warning'
      });
    } else {
      await Swal.fire({
        title: 'Error',
        text: respuesta.mensaje || 'Error interno del servidor',
        icon: 'error'
      });
    }
  } else {
    // Fallback para entornos sin SweetAlert2
    console.log('Resultado:', respuesta);
  }
}

module.exports = { 
  guardarPlantillaCasoUso,
  mostrarResultadoGuardado 
};