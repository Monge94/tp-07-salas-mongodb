// Crea middleware que asigna a cada solicitud un identificador consecutivo.
function crearIdentificadorSolicitud() {
  let siguienteSolicitud = 1;

  return (req, res, next) => {
    const numero = String(siguienteSolicitud).padStart(4, "0");
    res.locals.solicitudId = `BIB-${numero}`;
    siguienteSolicitud += 1;
    next();
  };
}

// Registra la duración una vez que Express termina de enviar la respuesta.
function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();

  res.on("finish", () => {
    const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
    console.log(
      `[medirDuracion] ${res.locals.solicitudId} ${req.method} ${req.originalUrl} ${res.statusCode} ${duracionMs.toFixed(2)} ms`,
    );
  });

  next();
}

module.exports = { crearIdentificadorSolicitud, medirDuracion };
