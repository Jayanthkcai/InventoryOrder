import envVal from "./envload.js"; // Load environment variables

const result = envVal;

import pg from "pg";
import { loggers } from "winston";
const { Pool } = pg;

console.log("pg user name ", process.env.POSTGRES_PASSWORD);

const pool = new Pool({
  user: process.env.POSTGRES_USER || "example",
  host: process.env.POSTGRES_HOST || "pgdbcontainer",
  database: process.env.POSTGRES_DB || "exampledb",
  password: process.env.POSTGRES_PASSWORD || "examplepwd",
  port: process.env.POSTGRES_PORT || 5432,
});

export default {
  query: (text, params) => pool.query(text, params),
};
