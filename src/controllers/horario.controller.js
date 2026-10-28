import { pool } from "../database/database.js";

// ✅ Obtener todos los horarios registrados (incluye joins informativos)
export const getHorarios = async (req, res) => {
  try {
    const query = `
      SELECT 
        h.horario_id,
        h.paralelo_id,
        p.descripcion AS paralelo_nombre,
        h.materia_id,
        m.nombre AS materia_nombre,
        h.prof_id,
        u.nombre AS prof_nombre,
        u.apellido AS prof_apellido,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin,
        h.activo,
        h.fecha_creacion
      FROM horarios h
      LEFT JOIN paralelo p ON h.paralelo_id = p.paralelo_id
      LEFT JOIN materias m ON h.materia_id = m.materia_id
      LEFT JOIN profesores prof ON h.prof_id = prof.prof_id
      LEFT JOIN usuarios u ON prof.usuario_id = u.usuario_id
      ORDER BY h.horario_id ASC
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
// ✅ Obtener horario por ID de estudiante (para la vista del alumno logueado)
export const getHorariosByEstudianteId = async (req, res) => {
  try {
    const { estudiante_id } = req.params;

    const query = `
      SELECT 
        h.horario_id,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin,
        m.nombre AS materia_nombre,
        u.nombre AS prof_nombre,
        u.apellido AS prof_apellido
      FROM horarios h
      INNER JOIN estudiantes e ON e.paralelo_id = h.paralelo_id
      INNER JOIN materias m ON h.materia_id = m.materia_id
      INNER JOIN profesores prof ON h.prof_id = prof.prof_id
      INNER JOIN usuarios u ON prof.usuario_id = u.usuario_id
      WHERE e.estudiante_id = $1 AND h.activo = true
      ORDER BY 
        CASE 
          WHEN LOWER(h.dia_semana) LIKE 'lune%' THEN 1
          WHEN LOWER(h.dia_semana) LIKE 'mar%' THEN 2
          WHEN LOWER(h.dia_semana) LIKE 'mi%r%' THEN 3
          WHEN LOWER(h.dia_semana) LIKE 'juev%' THEN 4
          WHEN LOWER(h.dia_semana) LIKE 'vier%' THEN 5
          ELSE 6
        END,
        h.hora_inicio ASC
    `;

    const { rows } = await pool.query(query, [estudiante_id]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener horario del estudiante:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Crear un nuevo bloque de horario
export const createHorario = async (req, res) => {
  try {
    const {
      paralelo_id,
      materia_id,
      prof_id,
      dia_semana,
      hora_inicio,
      hora_fin,
      activo,
    } = req.body;

    if (!paralelo_id || !materia_id || !prof_id || !dia_semana || !hora_inicio || !hora_fin) {
      return res.status(400).json({
        message: "Todos los campos (paralelo, materia, profesor, día, hora inicio y fin) son requeridos.",
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO horarios 
        (paralelo_id, materia_id, prof_id, dia_semana, hora_inicio, hora_fin, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        parseInt(paralelo_id, 10),
        parseInt(materia_id, 10),
        parseInt(prof_id, 10),
        dia_semana.trim(),
        hora_inicio,
        hora_fin,
        activo !== undefined ? activo : true,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear horario:", error);

    if (error.code === "23514") {
      // Violación de restricción CHECK (chk_horas_validas)
      return res.status(400).json({
        message: "La hora de fin debe ser posterior a la hora de inicio.",
      });
    }

    if (error.code === "23503") {
      // Violación de clave foránea (FK)
      return res.status(400).json({
        message: "El paralelo, materia o profesor especificado no existe.",
      });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Actualizar un registro de horario por ID
export const updateHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paralelo_id,
      materia_id,
      prof_id,
      dia_semana,
      hora_inicio,
      hora_fin,
      activo,
    } = req.body;

    const current = await pool.query(
      "SELECT * FROM horarios WHERE horario_id = $1",
      [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Horario no encontrado" });
    }

    const cur = current.rows[0];

    const newParalelo = paralelo_id ? parseInt(paralelo_id, 10) : cur.paralelo_id;
    const newMateria = materia_id ? parseInt(materia_id, 10) : cur.materia_id;
    const newProfesor = prof_id ? parseInt(prof_id, 10) : cur.prof_id;
    const newDia = dia_semana !== undefined ? dia_semana.trim() : cur.dia_semana;
    const newHoraInicio = hora_inicio ?? cur.hora_inicio;
    const newHoraFin = hora_fin ?? cur.hora_fin;
    const newActivo = activo !== undefined ? activo : cur.activo;

    const { rows } = await pool.query(
      `UPDATE horarios
       SET paralelo_id = $1,
           materia_id = $2,
           prof_id = $3,
           dia_semana = $4,
           hora_inicio = $5,
           hora_fin = $6,
           activo = $7
       WHERE horario_id = $8
       RETURNING *`,
      [
        newParalelo,
        newMateria,
        newProfesor,
        newDia,
        newHoraInicio,
        newHoraFin,
        newActivo,
        id,
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar horario:", error);

    if (error.code === "23514") {
      return res.status(400).json({
        message: "La hora de fin debe ser posterior a la hora de inicio.",
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        message: "El paralelo, materia o profesor especificado no existe.",
      });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Eliminar horario por ID
export const deleteHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      "DELETE FROM horarios WHERE horario_id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Horario no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar horario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};