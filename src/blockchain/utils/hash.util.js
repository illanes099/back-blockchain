import crypto from "crypto";

/**
 * Genera un Hash SHA-256 determinista a partir de los datos académicos
 * incluyendo todas las notas trimestrales y totales.
 */
export const generarHashBoletin = (estudianteId, paralelo, materias) => {
  // Ordenar materias alfabéticamente para asegurar que el hash sea determinista
  const materiasOrdenadas = [...materias].sort((a, b) =>
    a.materia.localeCompare(b.materia)
  );

  const payloadString = JSON.stringify({
    estudianteId,
    paralelo,
    materias: materiasOrdenadas.map((m) => ({
      materia: m.materia,
      trimestre1: Number(m.trimestre1) || 0,
      trimestre2: Number(m.trimestre2) || 0,
      trimestre3: Number(m.trimestre3) || 0,
      total: Number(m.total) || 0,
    })),
  });

  return "0x" + crypto.createHash("sha256").update(payloadString).digest("hex");
};