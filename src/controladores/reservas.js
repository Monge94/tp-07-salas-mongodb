const { salasPermitidas, turnosPermitidos } = require("../dominio/reservas");

// Prepara controladores que traducen acciones del router a vistas y respuestas.
function crearControladorReservas(servicioReservas) {
  return {
    // Muestra todas las reservas disponibles en el servicio.
    listar(req, res) {
      res.render("reservas/lista", {
        titulo: "Reservas",
        reservas: servicioReservas.listar(),
      });
    },
    // Presenta el formulario vacío junto con las opciones admitidas.
    nueva(req, res) {
      res.render("reservas/nueva", {
        titulo: "Nueva reserva",
        errores: [],
        formData: {
          estudiante: "",
          email: "",
          sala: "",
          fecha: "",
          turno: "",
          personas: "",
        },
        salasPermitidas,
        turnosPermitidos,
      });
    },
    // Busca el identificador de la URL y muestra el detalle o un 404.
    detalle(req, res) {
      const id = Number(req.params.id);
      const reserva = Number.isInteger(id)
        ? servicioReservas.buscarPorId(id)
        : undefined;

      if (!reserva) {
        return res.status(404).render("no-encontrado", {
          titulo: "Reserva no encontrada",
          mensaje: "No existe una reserva con ese identificador.",
        });
      }

      return res.render("reservas/detalle", {
        titulo: `Reserva #${reserva.id}`,
        reserva,
      });
    },
    // Guarda los datos validados y redirige al listado.
    crear(req, res) {
      servicioReservas.crear(req.reservaValidada);
      return res.redirect(302, "/reservas");
    },
  };
}

module.exports = { crearControladorReservas };
