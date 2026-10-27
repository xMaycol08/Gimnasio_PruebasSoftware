const { Pool, types } = require('pg');

// DATE llega como texto 'YYYY-MM-DD' (sin conversión de zona horaria, que descuadra los vencimientos).
types.setTypeParser(types.builtins.DATE, (valor) => valor);
// TIMESTAMP (sin zona) se guarda y se lee siempre como UTC.
types.setTypeParser(types.builtins.TIMESTAMP, (valor) => new Date(`${valor.replace(' ', 'T')}Z`));
// NUMERIC (precio, monto) llega como número y no como texto.
types.setTypeParser(types.builtins.NUMERIC, parseFloat);

let pool;

// El pool se crea la primera vez que se usa, así los tests no necesitan DATABASE_URL.
const obtenerPool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('Falta la variable de entorno DATABASE_URL (revisa tu archivo .env)');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
};

const query = (texto, parametros = []) => obtenerPool().query(texto, parametros);

const cerrar = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};

module.exports = { query, cerrar };
