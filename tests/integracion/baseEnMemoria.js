const fs = require('fs');
const path = require('path');
const { newDb, DataType } = require('pg-mem');

const aTexto = (valor) => (valor instanceof Date ? valor.toISOString().slice(0, 10) : valor);

// Base PostgreSQL simulada en memoria que usa el esquema real (database/schema.sql).
// Devuelve las fechas DATE como texto 'YYYY-MM-DD', igual que src/config/db.js con Supabase.
const crearBaseEnMemoria = () => {
  const memoria = newDb();
  memoria.public.registerFunction({
    name: 'char_length',
    args: [DataType.text],
    returns: DataType.integer,
    implementation: (texto) => texto.length,
  });
  memoria.public.none(fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8'));

  const { Pool } = memoria.adapters.createPg();
  const pool = new Pool();

  return {
    query: async (texto, parametros = []) => {
      const resultado = await pool.query(texto, parametros);
      resultado.rows = resultado.rows.map((fila) => ({
        ...fila,
        ...(fila.fecha_pago !== undefined && { fecha_pago: aTexto(fila.fecha_pago) }),
        ...(fila.fecha_vencimiento !== undefined && {
          fecha_vencimiento: aTexto(fila.fecha_vencimiento),
        }),
      }));
      return resultado;
    },
  };
};

module.exports = { crearBaseEnMemoria };
