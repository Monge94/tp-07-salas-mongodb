const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("path");
const { crearRutasAplicacion } = require("./rutas/aplicacion");
const { crearRutasReservas } = require("./rutas/reservas");
const {
  crearIdentificadorSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");

// Crea la aplicación Express y conecta sus middleware y rutas con el servicio.
function crearApp({ servicioReservas, formatoMorgan }) {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("layout", "layouts/main");

  app.use(morgan(formatoMorgan));
  app.use(crearIdentificadorSolicitud());
  app.use(medirDuracion);
  app.use(expressLayouts);
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use("/", crearRutasAplicacion(servicioReservas));
  app.use("/reservas", crearRutasReservas(servicioReservas));

  // Responde con la vista común cuando ninguna ruta anterior coincide.
  app.use((req, res) => {
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La página que buscás no existe.",
    });
  });

  return app;
}

module.exports = { crearApp };
