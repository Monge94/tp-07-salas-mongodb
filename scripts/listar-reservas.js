const { conectar, desconectar } = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

// Recupera y muestra documentos existentes, sin crear ni borrar registros.
async function ejecutar() {
  try {
    await conectar();
    const reservas = await Reserva.find().lean();

    for (const reserva of reservas) {
      console.log(
        [
          `_id: ${reserva._id.toString()}`,
          `estudiante: ${reserva.estudiante}`,
          `email: ${reserva.email}`,
          `sala: ${reserva.sala}`,
          `fecha: ${reserva.fecha}`,
          `turno: ${reserva.turno}`,
          `personas: ${reserva.personas}`,
        ].join(" | "),
      );
    }
    console.log(`Cantidad recuperada: ${reservas.length}`);
  } catch (error) {
    console.error(
      `No se pudieron listar las reservas (${error.name || "Error"}).`,
    );
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
