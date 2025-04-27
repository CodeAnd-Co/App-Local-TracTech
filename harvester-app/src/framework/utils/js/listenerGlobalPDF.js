(function () {

  if (window.__listenerPDFRegistrado) return;     // evita duplicados
  window.__listenerPDFRegistrado = true;
  console.log('[PDF-Listener] Registrado');

  document.addEventListener('click', (ev) => {
    const boton = ev.target.closest('#descargarPDF');
    if (!boton) return;                           // no era nuestro botón
    console.log('[PDF-Listener] Click detectado');

    if (typeof window.descargarPDF === 'function') {
      console.log('[PDF-Listener] Llamando a descargarPDF()');
      window.descargarPDF();
    } else {
      console.warn('[PDF-Listener] descargarPDF() NO está definida');
    }
  });
})();
