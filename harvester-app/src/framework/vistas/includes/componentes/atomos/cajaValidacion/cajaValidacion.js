document.addEventListener('DOMContentLoaded', () => {
  const cajas = document.querySelectorAll('.contenedor-caja input[type="checkbox"]');
  
  cajas.forEach((caja) => {
    const etiqueta = caja.closest('.contenedor-caja');
    
    caja.addEventListener('change', () => {
      if (caja.checked) {
        etiqueta.classList.add('marcada');
      } else {
        etiqueta.classList.remove('marcada');
      }
    });
  });
});
