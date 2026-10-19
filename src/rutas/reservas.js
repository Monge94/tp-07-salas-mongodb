const express = require("express");
const { crearControladorReservas } = require("../controladores/reservas");
const {
  prepararAreaReservas,
  validarReserva,
} = require("../middleware/reservas");

// Declara las rutas bajo /reservas y aplica middleware antes de sus handlers.
function crearRutasReservas(servicioReservas) {
  const router = express.Router();
  const controlador = crearControladorReservas(servicioReservas);

  // Prepara datos de presentación para todas las rutas de este router.
  router.use(prepararAreaReservas);
  router.get("/", controlador.listar);
  router.get("/nueva", controlador.nueva);
  router.get("/:id", controlador.detalle);
  // Valida el formulario antes de permitir que el controlador cree la reserva.
  router.post("/", validarReserva, controlador.crear);

  return router;
}

module.exports = { crearRutasReservas };
