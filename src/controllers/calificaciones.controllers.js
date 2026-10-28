import { pool } from "../database/database.js";

export const getCalificaciones = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM calificaciones");
  res.json(rows);
};

export const getCalificacionesMaterias = async (req, res) => {
  const { rows } = await pool.query(
    "SELECT c.calificacion_id, c.estudiante_id, c.total, m.nombre FROM calificaciones c, materias m WHERE m.materia_id = c.materia_id"
  );
  res.json(rows);
};

export const getCalificacion1 = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM calificaciones WHERE calificacion_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Calificación no encontrada" });
  }
  res.json(rows[0]);
};

// ✅ Crear o Actualizar Calificación (Evita duplicados al importar Excel)
export const createCalificacion = async (req, res) => {
  try {
    const {
      primer_trimestre,
      segundo_trimestre,
      tercer_trimestre,
      total,
      materia_id,
      estudiante_id,
    } = req.body;

    // Validar requeridos básicos
    if (
      primer_trimestre === undefined ||
      segundo_trimestre === undefined ||
      tercer_trimestre === undefined ||
      materia_id === undefined ||
      estudiante_id === undefined
    ) {
      return res.status(400).json({
        message:
          "primer_trimestre, segundo_trimestre, tercer_trimestre, materia_id y estudiante_id son requeridos",
      });
    }

    // Convertir a números para asegurar la compatibilidad con PostgreSQL
    const p1 = parseFloat(primer_trimestre) || 0;
    const p2 = parseFloat(segundo_trimestre) || 0;
    const p3 = parseFloat(tercer_trimestre) || 0;
    const tFinal = total !== undefined ? parseFloat(total) : Math.round((p1 + p2 + p3) / 3);

    const matId = parseInt(materia_id, 10);
    const estId = parseInt(estudiante_id, 10);

    // 1. Verificar si ya existe una calificación para este estudiante en esta materia especifica
    const existingCalificacion = await pool.query(
      `SELECT * FROM calificaciones WHERE estudiante_id = $1 AND materia_id = $2`,
      [estId, matId]
    );

    let resultRows;

    if (existingCalificacion.rows.length > 0) {
      // 2. Si ya existe, ACTUALIZAMOS el registro existente en lugar de crear uno nuevo
      const calificacionId = existingCalificacion.rows[0].calificacion_id;
      
      const updateResult = await pool.query(
        `UPDATE calificaciones
         SET primer_trimestre = $1,
             segundo_trimestre = $2,
             tercer_trimestre = $3,
             total = $4
         WHERE calificacion_id = $5
         RETURNING *`,
        [p1, p2, p3, tFinal, calificacionId]
      );
      
      resultRows = updateResult.rows[0];
      return res.status(200).json(resultRows); // 200 OK para actualización
    } else {
      // 3. Si no existe, CREAMOS un registro nuevo
      const insertResult = await pool.query(
        `INSERT INTO calificaciones
          (primer_trimestre, segundo_trimestre, tercer_trimestre, total, materia_id, estudiante_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [p1, p2, p3, tFinal, matId, estId]
      );

      resultRows = insertResult.rows[0];
      return res.status(201).json(resultRows); // 201 Created para nuevo registro
    }
  } catch (error) {
    console.error("--- [ERROR CREATE/UPDATE CALIFICACIÓN] ---", error);
    return res.status(500).json({
      message: "Error al registrar o actualizar la calificación",
      error: error.message,
    });
  }
};

export const updateCalificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      primer_trimestre,
      segundo_trimestre,
      tercer_trimestre,
      total,
      materia_id,
      estudiante_id,
    } = req.body;

    // 1. Obtener los valores actuales para no sobrescribir con NULL si falta alguno
    const current = await pool.query(
      "SELECT * FROM calificaciones WHERE calificacion_id = $1",
      [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Calificación no encontrada" });
    }

    const rowActual = current.rows[0];

    // 2. Usar operador NULL coalescing (??) para mantener los datos actuales si no se envían
    const p1 = primer_trimestre !== undefined ? parseFloat(primer_trimestre) : rowActual.primer_trimestre;
    const p2 = segundo_trimestre !== undefined ? parseFloat(segundo_trimestre) : rowActual.segundo_trimestre;
    const p3 = tercer_trimestre !== undefined ? parseFloat(tercer_trimestre) : rowActual.tercer_trimestre;
    
    // Si no viene 'total', lo recalculamos dinámicamente con los trimestres
    const tFinal = total !== undefined ? parseFloat(total) : Math.round((p1 + p2 + p3) / 3);
    
    const matId = materia_id !== undefined ? parseInt(materia_id, 10) : rowActual.materia_id;
    const estId = estudiante_id !== undefined ? parseInt(estudiante_id, 10) : rowActual.estudiante_id;

    // 3. Consulta UPDATE robusta
    const { rows } = await pool.query(
      `UPDATE calificaciones
       SET primer_trimestre = $1,
           segundo_trimestre = $2,
           tercer_trimestre = $3,
           total = $4,
           materia_id = $5,
           estudiante_id = $6
       WHERE calificacion_id = $7
       RETURNING *`,
      [p1, p2, p3, tFinal, matId, estId, id]
    );

    return res.json(rows[0]);
  } catch (error) {
    console.error("--- [ERROR UPDATE CALIFICACIÓN] ---", error);
    return res.status(500).json({
      message: "Error al actualizar la calificación",
      error: error.message,
    });
  }
};

export const deleteCalificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      "DELETE FROM calificaciones WHERE calificacion_id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Calificación no encontrada" });
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("--- [ERROR DELETE CALIFICACIÓN] ---", error);
    return res.status(500).json({
      message: "Error al eliminar la calificación",
      error: error.message,
    });
  }
};