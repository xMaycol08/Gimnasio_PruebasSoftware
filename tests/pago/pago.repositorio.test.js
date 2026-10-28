const db = require('../../src/config/db');
const repositorio = require('../../src/modules/pago/pago.repositorio');
const { pagoEjemplo } = require('./helpers');

jest.mock('../../src/config/db', () => ({ query: jest.fn() }));

describe('pago.repositorio', () => {
  afterEach(() => jest.clearAllMocks());

  test('crear inserta con parámetros y devuelve la fila', async () => {
    const fila = pagoEjemplo();
    db.query.mockResolvedValue({ rows: [fila] });
    const { id_pago, ...datos } = fila;
    const creado = await repositorio.crear(datos);
    expect(creado).toBe(fila);
    expect(id_pago).toBe(1);
    const [sql, parametros] = db.query.mock.calls[0];
    expect(sql).toContain('INSERT INTO pago');
    expect(parametros).toEqual([1, 1, '2026-03-01', '2026-03-31', 30, 'PAGADO']);
  });

  test('buscarPorId devuelve la fila o null', async () => {
    db.query.mockResolvedValueOnce({ rows: [pagoEjemplo()] });
    expect(await repositorio.buscarPorId(1)).toEqual(pagoEjemplo());
    db.query.mockResolvedValueOnce({ rows: [] });
    expect(await repositorio.buscarPorId(99)).toBeNull();
    expect(db.query.mock.calls[0][1]).toEqual([1]);
  });

  test('listar sin cliente no filtra', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await repositorio.listar();
    const [sql, parametros] = db.query.mock.calls[0];
    expect(sql).not.toContain('WHERE');
    expect(parametros).toEqual([]);
  });

  test('listar con cliente filtra por id_cliente', async () => {
    db.query.mockResolvedValue({ rows: [pagoEjemplo()] });
    expect(await repositorio.listar(5)).toEqual([pagoEjemplo()]);
    const [sql, parametros] = db.query.mock.calls[0];
    expect(sql).toContain('WHERE id_cliente = $1');
    expect(parametros).toEqual([5]);
  });

  test('actualizarEstado devuelve la fila o null', async () => {
    db.query.mockResolvedValueOnce({ rows: [pagoEjemplo({ estado: 'ANULADO' })] });
    expect((await repositorio.actualizarEstado(1, 'ANULADO')).estado).toBe('ANULADO');
    expect(db.query.mock.calls[0][1]).toEqual(['ANULADO', 1]);
    db.query.mockResolvedValueOnce({ rows: [] });
    expect(await repositorio.actualizarEstado(99, 'ANULADO')).toBeNull();
  });
});
