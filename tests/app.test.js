const request = require('supertest');
const crearApp = require('../src/app');
const db = require('../src/config/db');
const { ErrorConflicto } = require('../src/shared/errores');

jest.mock('../src/config/db', () => ({ query: jest.fn(), cerrar: jest.fn() }));

describe('API base', () => {
  const app = crearApp({ directorioModulos: __dirname + '/fixtures/modulos' });

  afterEach(() => jest.clearAllMocks());

  test('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('ok');
  });

  test('GET /health/db responde ok cuando la base contesta', async () => {
    db.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });
    const res = await request(app).get('/health/db');
    expect(res.status).toBe(200);
    expect(res.body.baseDeDatos).toBe('conectada');
  });

  test('GET /health/db responde 500 si la base falla', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    db.query.mockRejectedValue(new Error('sin conexión'));
    const res = await request(app).get('/health/db');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error interno del servidor');
  });

  test('ruta inexistente responde 404 en JSON', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('GET /no-existe');
  });

  test('JSON mal formado responde 400', async () => {
    const res = await request(app)
      .post('/api/ejemplo')
      .set('Content-Type', 'application/json')
      .send('{ invalido');
    expect(res.status).toBe(400);
  });

  test('un módulo cargado automáticamente responde', async () => {
    const res = await request(app).get('/api/ejemplo');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ modulo: 'ejemplo' });
  });

  test('los errores de negocio usan su código HTTP', async () => {
    const res = await request(app).get('/api/ejemplo/conflicto');
    expect(res.status).toBe(409);
    expect(res.body.error).toBe(new ErrorConflicto('ya existe').message);
  });
});
