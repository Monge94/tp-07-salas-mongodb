const { crearConfiguracion } = require("./configuracion");
const { crearApp } = require("./app");
const { crearServicioReservas } = require("./servicios/reservas");

// Semilla ficticia usada únicamente por la aplicación web en memoria.
const datosIniciales = [
  {
    id: 1,
    estudiante: "Lucía Fernández",
    email: "lucia.fernandez@example.com",
    sala: "Sala Norte",
    fecha: "2026-10-02",
    turno: "Mañana",
    personas: 2,
  },
  {
    id: 2,
    estudiante: "Mateo Gómez",
    email: "mateo.gomez@example.com",
    sala: "Sala Sur",
    fecha: "2026-10-03",
    turno: "Tarde",
    personas: 4,
  },
  {
    id: 3,
    estudiante: "Sofía Torres",
    email: "sofia.torres@example.com",
    sala: "Sala Multimedia",
    fecha: "2026-10-04",
    turno: "Noche",
    personas: 3,
  },
  {
    id: 4,
    estudiante: "Tomás Ruiz",
    email: "tomas.ruiz@example.com",
    sala: "Sala Norte",
    fecha: "2026-10-05",
    turno: "Mañana",
    personas: 1,
  },
];

const configuracion = crearConfiguracion(process.env);
const servicioReservas = crearServicioReservas(datosIniciales);
const app = crearApp({
  servicioReservas,
  formatoMorgan: configuracion.formatoMorgan,
});

// Inicia el servidor HTTP una vez preparada la configuración y sus dependencias.
app.listen(configuracion.port, () => {
  console.log(`Servidor disponible en http://localhost:${configuracion.port}`);
});
