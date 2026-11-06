const pool = require('../config/db');

async function dump() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map((r) => Object.values(r)[0]);
    console.log('Tabelas encontradas:', tableNames);

    for (const t of tableNames) {
      const [createRes] = await pool.query('SHOW CREATE TABLE ' + t);
      console.log('\n=============================================');
      console.log('TABELA:', t);
      console.log(createRes[0]['Create Table']);

      const [countRes] = await pool.query('SELECT COUNT(*) as c FROM ' + t);
      console.log('Total de linhas:', countRes[0].c);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

dump();

