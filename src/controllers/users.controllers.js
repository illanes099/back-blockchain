import { pool } from "../database/database.js";

export const getUsers = async (req, res) => {
  const { rows } = await pool.query("select * from usuario");

  res.json(rows);
}

export const getUser =  async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "select *  from usuario where usuario_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "User not founf" });
  }
  res.json(rows[0]);
}

export const createUser = async (req, res) => {
  const data = req.body;
  const { rows } = await pool.query(
    "insert into usuario (nombre,paterno,materno,oficina) values ($1, $2, $3, $4) RETURNING *",
    [data.nombre, data.paterno, data.materno, data.oficina]
  );

  return res.json(rows[0]);
}


export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "delete from usuario where usuario_id = $1 RETURNING *",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "User not founf" });
  }
  return res.sendStatus(204);
}

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const {rows} = await pool.query(
    "update usuario set nombre = $1 ,paterno = $2, materno = $3, oficina = $4 where usuario_id = $5 returning *",
   [data.nombre, data.paterno, data.materno, data.oficina, id]
  );
  return res.json(rows[0]);
}





