import { pool } from "../database/database.js";

export const getBoletines = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM boletines");
  res.json(rows);
};

export const getBoletin1 = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM boletines WHERE boletin_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Boletín no encontrado" });
  }

  res.json(rows[0]);
};

export const createBoletin = async (req, res) => {
  const {
    usuario_id,
    direc_id,
    prof_id,
    materia_id,
    calificac_id,
    fecha,
    descripcion,
  } = req.body;

  if (
    !usuario_id ||
    !direc_id ||
    !prof_id ||
    !materia_id ||
    !calificac_id ||
    !fecha
  ) {
    return res.status(400).json({
      message:
        "usuario_id, direc_id, prof_id, materia_id, calificac_id y fecha son requeridos",
    });
  }

  const { rows } = await pool.query(
    `INSERT INTO boletines 
    (usuario_id, direc_id, prof_id, materia_id, calificac_id, fecha, descripcion)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [usuario_id, direc_id, prof_id, materia_id, calificac_id, fecha, descripcion]
  );

  return res.json(rows[0]);
};

export const updateBoletin = async (req, res) => {
  const { id } = req.params;
  const {
    usuario_id,
    direc_id,
    prof_id,
    materia_id,
    calificac_id,
    fecha,
    descripcion,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE boletines
     SET usuario_id = $1,
         direc_id = $2,
         prof_id = $3,
         materia_id = $4,
         calificac_id = $5,
         fecha = $6,
         descripcion = $7
     WHERE boletin_id = $8
     RETURNING *`,
    [usuario_id, direc_id, prof_id, materia_id, calificac_id, fecha, descripcion, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Boletín no encontrado" });
  }

  return res.json(rows[0]);
};

export const deleteBoletin = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM boletines WHERE boletin_id = $1",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Boletín no encontrado" });
  }

  return res.sendStatus(204);
};
