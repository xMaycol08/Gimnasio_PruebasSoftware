// Uso: npm run db:check  (comprueba que el .env apunta a Supabase y que las 4 tablas existen)
require('dotenv').config();
const db = require('../src/config/db');

const TABLAS = ['cliente', 'membresia', 'pago', 'acceso'];

(async () => {
  try {
    const { rows } = await db.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name = ANY($2)',
      ['public', TABLAS]
    );
    const existentes = rows.map((fila) => fila.table_name);
    const faltantes = TABLAS.filter((tabla) => !existentes.includes(tabla));
    console.warn('Conexión correcta.');
    console.warn(`Tablas encontradas: ${existentes.join(', ') || 'ninguna'}`);
    if (faltantes.length > 0) {
      console.error(`Faltan tablas: ${faltantes.join(', ')}. Ejecuta database/schema.sql en Supabase.`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`No se pudo conectar: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await db.cerrar();
  }
})();
