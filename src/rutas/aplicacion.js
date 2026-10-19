const express = require("express");
const { crearControladorAplicacion } = require("../controladores/aplicacion");

// Declara las rutas generales y las conecta con su controlador.
function crearRutasAplicacion(servicioReservas) {
  const router = express.Router();
  const controlador = crearControladorAplicacion(servicioReservas);

  router.get("/", controlador.inicio);
  router.get("/estado", controlador.estado);

  return router;
}

module.exports = { crearRutasAplicacion };
