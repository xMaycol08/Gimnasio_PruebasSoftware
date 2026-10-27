const mockQuery = jest.fn();
const mockEnd = jest.fn();

const mockSetTypeParser = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({ query: mockQuery, end: mockEnd })),
  types: {
    builtins: { DATE: 1082, TIMESTAMP: 1114, NUMERIC: 1700 },
    setTypeParser: (...args) => mockSetTypeParser(...args),
  },
}));

describe('config/db', () => {
  let db;
  const urlOriginal = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    db = require('../../src/config/db');
  });

  afterAll(() => {
    process.env.DATABASE_URL = urlOriginal;
  });

  test('configura los parsers de DATE, TIMESTAMP y NUMERIC', () => {
    const parser = (tipo) => mockSetTypeParser.mock.calls.find(([t]) => t === tipo)[1];
    expect(parser(1082)('2026-02-28')).toBe('2026-02-28');
    expect(parser(1114)('2026-02-28 10:30:00').toISOString()).toBe('2026-02-28T10:30:00.000Z');
    expect(parser(1700)('45.50')).toBe(45.5);
  });

  test('lanza un error claro si falta DATABASE_URL', () => {
    delete process.env.DATABASE_URL;
    expect(() => db.query('SELECT 1')).toThrow('Falta la variable de entorno DATABASE_URL');
  });

  test('ejecuta la consulta con sus parámetros', async () => {
    process.env.DATABASE_URL = 'postgresql://usuario:clave@localhost:5432/prueba';
    mockQuery.mockResolvedValue({ rows: [] });
    await db.query('SELECT * FROM cliente WHERE id_cliente = $1', [1]);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM cliente WHERE id_cliente = $1', [1]);
  });

  test('cerrar libera el pool', async () => {
    process.env.DATABASE_URL = 'postgresql://usuario:clave@localhost:5432/prueba';
    await db.query('SELECT 1');
    await db.cerrar();
    expect(mockEnd).toHaveBeenCalledTimes(1);
  });

  test('cerrar sin pool no falla', async () => {
    await expect(db.cerrar()).resolves.toBeUndefined();
  });
});
