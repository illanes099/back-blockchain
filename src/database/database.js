import pg, { Query } from "pg";

import {
  DB_USER,
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
} from "../config.js";

export const pool = new pg.Pool({
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
  ssl: {
    rejectUnauthorized: false, 
  },
});
