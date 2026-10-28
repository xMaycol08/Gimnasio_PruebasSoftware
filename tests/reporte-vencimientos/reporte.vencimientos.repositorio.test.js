const db = require('../../src/config/db');
const repositorio = require('../../src/modules/reporte-vencimientos/reporte.vencimientos.repositorio');

jest.mock('../../src/config/db', () => ({ query: jest.fn() }));

test('listarPagosActivos une pago con cliente y excluye los anulados', async () => {
  db.query.mockResolvedValue({ rows: [{ id_cliente: 1 }] });
  expect(await repositorio.listarPagosActivos()).toEqual([{ id_cliente: 1 }]);
  const [sql] = db.query.mock.calls[0];
  expect(sql).toContain('JOIN cliente');
  expect(sql).toContain("IN ('PAGADO', 'PENDIENTE')");
});
