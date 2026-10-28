import { pool } from "../database/database.js";

export const getMaterias = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM materias");
  res.json(rows);
};

export const getMateria1 = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM materias WHERE materia_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Materia no encontrada" });
  }

  res.json(rows[0]);
};

export const createMateria = async (req, res) => {
  const { nombre, codigo, descripcion, paralelo_id, prof_id } = req.body;

  if (!nombre || !codigo || !paralelo_id || !prof_id) {
    return res
      .status(400)
      .json({ message: "nombre, codigo, paralelo_id y prof_id son requeridos" });
  }

  const { rows } = await pool.query(
    `INSERT INTO materias (nombre, codigo, descripcion, paralelo_id, prof_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nombre, codigo, descripcion, paralelo_id, prof_id]
  );

  return res.json(rows[0]);
};

export const updateMateria = async (req, res) => {
  const { id } = req.params;
  const { nombre, codigo, descripcion, paralelo_id, prof_id } = req.body;

  const { rows } = await pool.query(
    `UPDATE materias
     SET nombre = $1, codigo = $2, descripcion = $3, paralelo_id = $4, prof_id = $5
     WHERE materia_id = $6
     RETURNING *`,
    [nombre, codigo, descripcion, paralelo_id, prof_id, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Materia no encontrada" });
  }

  return res.json(rows[0]);
};

export const deleteMateria = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM materias WHERE materia_id = $1",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Materia no encontrada" });
  }

  return res.sendStatus(204);
};



export const getMateriaUsername = async (req,res) =>{
  try {
    const {rows} = await pool.query("select * from  materia_profesores");
    return res.status(200).json(rows);
  } catch (error) {
    console.error("error al sacar datos de la base de datos ",error);
    throw error;
    return res.status(500).json({
      message: "Error interno del servidor al consultar la vista de profesores."
    });
  }
}