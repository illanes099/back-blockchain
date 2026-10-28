import { pool } from "../database/database.js";

export const getGrupos = async (req, res) => {
  const { rows } = await pool.query("select * from grupos");

  res.json(rows);
}

export const getGrupo =  async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "select *  from grupos where grupo_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "User not founf" });
  }
  res.json(rows[0]);
}

export const createGrupo = async (req, res) => {
  const data = req.body;
  const { rows } = await pool.query(
    "insert into grupos (nombre_grupo,nombre_rubro,descripcion) values ($1, $2, $3) RETURNING *",
    [data.nombre_grupo, data.nombre_rubro, data.descripcion]
  );

  return res.json(rows[0]);
}


export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "delete from grupos where grupo_id = $1 RETURNING *",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "User not founf" });
  }
  return res.sendStatus(204);
}

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const {rows} = await pool.query(
    "update grupos set nombre_grupo = $1 ,nombre_rubro = $2, descripcion = $3 where grupo_id = $4 returning *",
    [data.nombre_grupo, data.nombre_rubro, data.descripcion, id]
  );
  return res.json(rows[0]);
}