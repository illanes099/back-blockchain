import { pool } from "../database/database.js";

// ✅ Obtener todos los estudiantes
export const getestudiantes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM estudiantes ORDER BY estudiante_id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Crear un nuevo estudiante
export const createestudiante = async (req, res) => {
  try {
    const { usuario_id, paralelo_id } = req.body;

    if (!usuario_id || !paralelo_id) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos (usuario_id y paralelo_id)" });
    }

    // 1. Verificar si el usuario ya está registrado como estudiante
    const current = await pool.query(
      "SELECT * FROM estudiantes WHERE usuario_id = $1",
      [usuario_id]
    );

    if (current.rows.length > 0) {
      // 2. Si YA existe, actualizamos el paralelo_id en lugar de duplicar la fila
      const { rows } = await pool.query(
        `UPDATE estudiantes 
         SET paralelo_id = $1 
         WHERE usuario_id = $2 
         RETURNING *`,
        [paralelo_id, usuario_id]
      );
      return res.status(200).json(rows[0]);
    }

    // 3. Si NO existe, creamos el nuevo estudiante
    const { rows } = await pool.query(
      `INSERT INTO estudiantes (usuario_id, paralelo_id)
       VALUES ($1, $2)
       RETURNING *`,
      [usuario_id, paralelo_id]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear/actualizar estudiante:", error);
    
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ message: "El usuario ya está registrado como estudiante" });
    }
    if (error.code === "23514") {
      return res
        .status(400)
        .json({ message: "Restricción de tabla no cumplida" });
    }

    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// ✅ Actualizar estudiante (Con soporte exacto para tipo bytea mediante ::bytea)
export const updateestudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { paralelo_id, frase, foto } = req.body;

    console.log("--- [BACKEND] INICIO ACTUALIZACIÓN ESTUDIANTE ---");
    console.log("ID recibido:", id);

    const current = await pool.query(
      "SELECT * FROM estudiantes WHERE estudiante_id = $1",
      [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const newParalelo_id = paralelo_id ?? current.rows[0].paralelo_id;
    const newfrase = frase ?? current.rows[0].frase;

    let newFotoBuffer = current.rows[0].foto;

    if (foto !== undefined) {
      if (typeof foto === "string" && foto.includes("base64,")) {
        const base64Data = foto.split(";base64,").pop();
        newFotoBuffer = Buffer.from(base64Data, "base64");
        console.log("Foto procesada a Buffer. Tamaño:", newFotoBuffer.length);
      } else if (foto === "" || foto === null) {
        newFotoBuffer = null;
      }
    }

    const { rows } = await pool.query(
      `UPDATE estudiantes
       SET paralelo_id = $1, frase = $2, foto = $3::bytea
       WHERE estudiante_id = $4
       RETURNING *`,
      [newParalelo_id, newfrase, newFotoBuffer, id]
    );

    console.log("--- [BACKEND] ACTUALIZACIÓN EXITOSA EN BD ---");
    return res.json(rows[0]);

  } catch (error) {
    console.error("--- [BACKEND ERROR] ---", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// ✅ Eliminar estudiante
export const deleteestudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      "DELETE FROM estudiantes WHERE estudiante_id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar estudiante:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Obtener estudiante por ID 
export const getestudianteById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM estudiantes WHERE estudiante_id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener estudiante:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};