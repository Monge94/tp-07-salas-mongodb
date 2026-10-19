const mongoose = require("mongoose");
const { salasPermitidas, turnosPermitidos } = require("../dominio/reservas");

// Describe los campos y reglas que Mongoose valida antes de guardar cada reserva.
const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /@/,
    },
    sala: {
      type: String,
      required: true,
      enum: salasPermitidas,
    },
    fecha: {
      type: String,
      required: true,
      trim: true,
    },
    turno: {
      type: String,
      required: true,
      enum: turnosPermitidos,
    },
    personas: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      validate: {
        validator: Number.isInteger,
        message: "La cantidad de personas debe ser un entero.",
      },
    },
  },
  { collection: "reservas" },
);

// Fija el nombre de colección y reutiliza el modelo si ya fue registrado.
const Reserva =
  mongoose.models.Reserva || mongoose.model("Reserva", reservaSchema);

module.exports = Reserva;
