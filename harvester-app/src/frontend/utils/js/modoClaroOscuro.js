
let modoOscuro = localStorage.getItem('modoOscuro');

const activarModoOscuro = () => {
    document.body.classList.add('modoOscuro')
    localStorage.setItem('modoOscuro', 'activo');
}

const desactivarModoOscuro = () => {
    document.body.classList.remove('modoOscuro');
    localStorage.setItem('modoOscuro', null);
}

if(modoOscuro === 'activo') activarModoOscuro();

function inicializarTema () {
    const switchModoOsc = document.getElementById('switchModo');

    switchModoOsc.addEventListener("click", () => {
        modoOscuro = localStorage.getItem('modoOscuro')
        modoOscuro !== "activo" ? activarModoOscuro() : desactivarModoOscuro();
    })
}
