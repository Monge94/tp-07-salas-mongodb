const { salasPermitidas, turnosPermitidos } = require("../dominio/reservas");

// Agrega el nombre de sección que usan las vistas del área de reservas.
function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

// Normaliza los campos, comprueba las reglas y sólo continúa con datos válidos.
function validarReserva(req, res, next) {
  const recibido = req.body;
  const formData = {
    estudiante:
      typeof recibido.estudiante === "string" ? recibido.estudiante.trim() : "",
    email: typeof recibido.email === "string" ? recibido.email.trim() : "",
    sala: typeof recibido.sala === "string" ? recibido.sala.trim() : "",
    fecha: typeof recibido.fecha === "string" ? recibido.fecha.trim() : "",
    turno: typeof recibido.turno === "string" ? recibido.turno.trim() : "",
    personas:
      typeof recibido.personas === "string" ? recibido.personas.trim() : "",
  };
  const personas = Number(formData.personas);
  const errores = [];

  if (!formData.estudiante) {
    errores.push("El nombre del estudiante es obligatorio.");
  }
  if (!formData.email) {
    errores.push("El email es obligatorio.");
  } else if (!formData.email.includes("@")) {
    errores.push("El email debe contener @.");
  }
  if (!formData.sala) {
    errores.push("La sala es obligatoria.");
  } else if (!salasPermitidas.includes(formData.sala)) {
    errores.push("Seleccioná una sala permitida.");
  }
  if (!formData.fecha) {
    errores.push("La fecha es obligatoria.");
  }
  if (!formData.turno) {
    errores.push("El turno es obligatorio.");
  } else if (!turnosPermitidos.includes(formData.turno)) {
    errores.push("Seleccioná un turno permitido.");
  }
  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    errores.push("La cantidad de personas debe ser un entero entre 1 y 6.");
  }

  if (errores.length > 0) {
    // Conserva lo ingresado para que la persona pueda corregir el formulario.
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores,
      formData,
      salasPermitidas,
      turnosPermitidos,
    });
  }

  // Pasa el objeto normalizado al controlador sin volver a leer el cuerpo crudo.
  req.reservaValidada = { ...formData, personas };
  return next();
}

module.exports = { prepararAreaReservas, validarReserva };
