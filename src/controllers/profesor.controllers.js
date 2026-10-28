import { json } from "sequelize";
import { pool } from "../database/database.js";

export const getProfesores = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM profesores");
  res.json(rows);
};

export const getProfesor = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM profesores WHERE prof_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Profesor no encontrado" });
  }

  res.json(rows[0]);
};

export const createProfesor = async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ message: "usuario_id es requerido" });
  }

  const { rows } = await pool.query(
    "INSERT INTO profesores (usuario_id) VALUES ($1) RETURNING *",
    [usuario_id]
  );

  return res.json(rows[0]);
};

export const updateProfesor = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, frase, fotos } = req.body;

    console.log("--- [BACKEND] INICIO ACTUALIZACIÓN PROFESOR ---");
    console.log("ID (prof_id) recibido:", id);

    // 1. Verificar si el profesor existe en la base de datos
    const current = await pool.query(
      "SELECT * FROM profesores WHERE prof_id = $1",
      [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }

    // 2. Mantener valores actuales si no se envían nuevos
    const newUsuario_id = usuario_id ?? current.rows[0].usuario_id;
    const newFrase = frase ?? current.rows[0].frase;

    // 3. Procesar la imagen (fotos) para la columna bytea
    let newFotosBuffer = current.rows[0].fotos;

    if (fotos !== undefined) {
      if (typeof fotos === "string" && fotos.includes("base64,")) {
        const base64Data = fotos.split(";base64,").pop();
        newFotosBuffer = Buffer.from(base64Data, "base64");
        console.log("Foto de profesor procesada a Buffer. Tamaño:", newFotosBuffer.length);
      } else if (fotos === "" || fotos === null) {
        newFotosBuffer = null;
      }
    }

    // 4. Actualización en PostgreSQL
    const { rows } = await pool.query(
      `UPDATE profesores
       SET usuario_id = $1, frase = $2, fotos = $3::bytea
       WHERE prof_id = $4
       RETURNING *`,
      [newUsuario_id, newFrase, newFotosBuffer, id]
    );

    console.log("--- [BACKEND] ACTUALIZACIÓN PROFESOR EXITOSA EN BD ---");
    return res.json(rows[0]);

  } catch (error) {
    console.error("--- [BACKEND ERROR PROFESOR] ---", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const deleteProfesor = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM profesores WHERE prof_id = $1",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Profesor no encontrado" });
  }

  return res.sendStatus(204);
};

export const getCalificacionesGeneral = async (req, res) => {
  const { rows } = await pool.query("select * from vista_estudiantes_general");
  res.json(rows);
};

export const getMateriasConProfesores = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM materiasConProfesor");
    res.json(rows).status(200);
  } catch (error) {
    return res.json(404).json({ message: "datos no encontrados" });
  }
};
