const { Pool } = require('pg');

const pool = new Pool({
  host: 'dpg-d0797f9r0fns738brrs0-a.oregon-postgres.render.com',
  user: 'zubair_h',
  password: 'RguNHJH3eYAxkLMExdm8zbmiYBsYM7um',
  database: 'workwave_db_wbqw',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
