// Adapta las acciones de las rutas generales a las respuestas HTTP y vistas.
function crearControladorAplicacion(servicioReservas) {
  return {
    // Renderiza la página principal.
    inicio(req, res) {
      res.render("inicio", { titulo: "Inicio" });
    },
    // Informa el estado del servidor y la cantidad actual de reservas.
    estado(req, res) {
      res.json({
        servicio: "activo",
        reservas: servicioReservas.contar(),
        solicitudId: res.locals.solicitudId,
      });
    },
  };
}

module.exports = { crearControladorAplicacion };
