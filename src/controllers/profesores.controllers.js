import { pool } from "../database/database.js";

export const getVistaProfesores = async (req, res) => {
  const { rows } = await pool.query("select * from vista_profesores");

  res.json(rows);
}
