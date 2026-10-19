// Construye el almacén temporal que usa el sitio mientras este proceso está activo.
function crearServicioReservas(datosIniciales) {
  const reservas = datosIniciales.map((reserva) => ({ ...reserva }));
  let siguienteId =
    reservas.length > 0
      ? Math.max(...reservas.map((reserva) => reserva.id)) + 1
      : 1;

  return {
    // Devuelve las reservas cargadas y creadas durante esta ejecución.
    listar() {
      return reservas;
    },
    // Busca una reserva por su identificador numérico.
    buscarPorId(id) {
      return reservas.find((reserva) => reserva.id === id);
    },
    // Informa cuántas reservas mantiene el almacén en memoria.
    contar() {
      return reservas.length;
    },
    // Agrega una reserva y asigna el próximo identificador disponible.
    crear(datos) {
      const reserva = { id: siguienteId, ...datos };
      reservas.push(reserva);
      siguienteId += 1;
      return reserva;
    },
  };
}

module.exports = { crearServicioReservas };
