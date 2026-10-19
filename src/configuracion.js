// Valida el entorno y deriva la configuración que necesita el servidor.
function crearConfiguracion(entorno) {
  const portTexto = entorno.PORT === undefined ? "3000" : entorno.PORT;
  const port = Number(portTexto);

  if (
    !/^\d+$/.test(portTexto) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    // Fallar al inicio evita que el servidor use un puerto accidental o inválido.
    throw new Error(
      `PORT debe ser un número entero entre 1 y 65535 (recibido: "${portTexto}").`,
    );
  }

  const nodeEnv = entorno.NODE_ENV || "development";

  return {
    port,
    nodeEnv,
    formatoMorgan: nodeEnv === "production" ? "combined" : "dev",
  };
}

module.exports = { crearConfiguracion };
