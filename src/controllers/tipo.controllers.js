import { pool } from "../database/database.js";

export const getTipo = async (req, res) => {
  const { rows } = await pool.query("select * from tipo");

  res.json(rows);
};
