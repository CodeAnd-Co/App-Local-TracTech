document.addEventListener('DOMContentLoaded', function() {
  const cajas = document.querySelectorAll('.contenedor-caja input[type="checkbox"]');
  
  cajas.forEach(function(caja) {
    const etiqueta = caja.closest('.contenedor-caja');
    
    caja.addEventListener('change', function() {
      if (caja.checked) {
        etiqueta.classList.add('marcada');
      } else {
        etiqueta.classList.remove('marcada');
      }
    });
  });
});
