const { conectar, desconectar } = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

// Datos ficticios que se insertan de nuevo cada vez que se ejecuta este programa.
const datosReserva = {
  estudiante: "Ana Ejemplo",
  email: "ana.ejemplo@example.com",
  sala: "Sala Norte",
  fecha: "2026-11-10",
  turno: "Mañana",
  personas: 2,
};

// Guarda una reserva confirmada, informa su _id y cierra la conexión.
async function ejecutar() {
  try {
    await conectar();
    const reserva = await Reserva.create(datosReserva);
    console.log(`Reserva guardada. _id: ${reserva._id.toString()}`);
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("La reserva no cumple las reglas del modelo.");
      for (const [campo, detalle] of Object.entries(error.errors)) {
        console.error(`- ${campo}: ${detalle.message}`);
      }
    } else {
      console.error(
        `No se pudo guardar la reserva (${error.name || "Error"}).`,
      );
    }
    process.exitCode = 1;
  } finally {
    try {
      await desconectar();
    } catch (error) {
      console.error(`No se pudo cerrar la conexión: ${error.name}.`);
      process.exitCode = 1;
    }
  }
}

ejecutar();
