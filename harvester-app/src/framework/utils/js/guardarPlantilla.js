// utils/js/guardarPlantilla.js
// — use ES module or plain script (no require) —

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("guardarPlantilla");
  if (!btn) {
    console.warn("No existe #guardarPlantilla");
    return;
  }

  btn.addEventListener("click", async () => {
    console.log("Botón presionado");

    const cont = document.getElementById("previsualizacion");
    if (!cont) {
      console.warn("No existe #previsualizacion");
      return;
    }

    const html = cont.outerHTML;
    console.log(html);

    // Si tuguardarPlantillas funciona en el front, haz:
    // guardarPlantillas.guardarPlantilla(html);

    // O bien envía un POST a tu API:
    /*
    try {
      const res = await fetch("/api/plantillas/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html })
      });
      if (!res.ok) throw new Error(res.statusText);
      console.log("Guardado OK", await res.json());
    } catch (e) {
      console.error("Error al guardar:", e);
    }
    */
  });
});
