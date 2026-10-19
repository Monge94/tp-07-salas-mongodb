const dns = require("node:dns");
const mongoose = require("mongoose");

// Configura resolutores para las consultas DNS de este proceso de Node.js.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Valida la URI privada y espera hasta que Mongoose conecte con MongoDB.
async function conectar() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const error = new Error("Falta la variable de entorno MONGODB_URI.");
    error.name = "ConfigurationError";
    throw error;
  }
  // No continuar si la aplicación no recibió una URI con un prefijo conocido.
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    const error = new Error(
      "MONGODB_URI debe comenzar con mongodb:// o mongodb+srv://.",
    );
    error.name = "ConfigurationError";
    throw error;
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}

// Libera la conexión para que los programas de consola puedan terminar.
async function desconectar() {
  await mongoose.disconnect();
}

module.exports = { conectar, desconectar };
