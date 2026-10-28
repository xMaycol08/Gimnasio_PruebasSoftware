const db = require('../../src/config/db');
const repositorio = require('../../src/modules/reporte-asistencia/reporte.asistencia.repositorio');

jest.mock('../../src/config/db', () => ({ query: jest.fn() }));

test('listarAccesos filtra por el rango de entrada con parámetros', async () => {
  db.query.mockResolvedValue({ rows: [{ id_acceso: 1 }] });
  expect(await repositorio.listarAccesos('2026-03-01', '2026-04-01')).toEqual([{ id_acceso: 1 }]);
  const [sql, parametros] = db.query.mock.calls[0];
  expect(sql).toContain('JOIN cliente');
  expect(parametros).toEqual(['2026-03-01', '2026-04-01']);
});
