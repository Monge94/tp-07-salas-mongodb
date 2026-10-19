const { conectar, desconectar } = require("../src/config/base-datos");

// Recorre los errores anidados para recuperar causas de red/DNS sin mostrar la URI.
function erroresAnidados(error) {
  const pendientes = [error];
  const vistos = new Set();
  const encontrados = [];

  while (pendientes.length > 0) {
    const actual = pendientes.pop();
    if (!actual || typeof actual !== "object" || vistos.has(actual)) {
      continue;
    }

    vistos.add(actual);
    encontrados.push(actual);
    pendientes.push(actual.cause, actual.reason);

    if (Array.isArray(actual.errors)) {
      pendientes.push(...actual.errors);
    }
    if (actual.servers instanceof Map) {
      for (const servidor of actual.servers.values()) {
        pendientes.push(servidor.error);
      }
    }
  }

  return encontrados;
}

// Imprime diagnóstico seguro con tipo, código y operación si están disponibles.
function informarError(error) {
  if (error.name === "ConfigurationError") {
    console.error(`Error de configuración: ${error.message}`);
  } else {
    console.error("No se pudo conectar con MongoDB.");
  }

  for (const actual of erroresAnidados(error)) {
    const datos = [`tipo=${actual.name || "Error"}`];
    if (actual.code) {
      datos.push(`código=${actual.code}`);
    }
    if (actual.syscall) {
      datos.push(`operación=${actual.syscall}`);
    }
    console.error(datos.join(" "));
  }
}

// Prueba la conexión sin escribir documentos y siempre intenta cerrarla.
async function ejecutar() {
  try {
    await conectar();
    console.log("Conexión con MongoDB establecida correctamente.");
  } catch (error) {
    informarError(error);
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
