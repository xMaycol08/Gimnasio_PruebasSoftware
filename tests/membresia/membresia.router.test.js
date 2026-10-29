const request = require('supertest');
const express = require('express');
const crearRouter = require('../../src/modules/membresia/membresia.router');
const { ErrorValidacion, ErrorNoEncontrado, ErrorConflicto } = require('../../src/shared/errores');

// Manejador de errores básico para que Express atrape los errores del router en las pruebas
const manejadorErroresTest = (err, req, res, _next) => {
  if (err instanceof ErrorValidacion) {return res.status(400).json({ error: err.message });}
  if (err instanceof ErrorNoEncontrado) {return res.status(404).json({ error: err.message });}
  if (err instanceof ErrorConflicto) {return res.status(409).json({ error: err.message });}
  res.status(500).json({ error: 'Error interno' });
};

describe('Membresia Router', () => {
  let app;
  let servicioFalso;

  beforeEach(() => {
    servicioFalso = {
      crear: jest.fn(),
      listar: jest.fn(),
      obtenerPorId: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
    };

    app = express();
    app.use(express.json());
    app.use('/api/membresias', crearRouter(servicioFalso));
    app.use(manejadorErroresTest);
  });

  test('POST /api/membresias (201) - crea membresía', async () => {
    servicioFalso.crear.mockResolvedValue({ id_membresia: 1, nombre: 'Anual' });
    const res = await request(app).post('/api/membresias').send({ nombre: 'Anual', precio: 300, duracion_dias: 365 });
    expect(res.status).toBe(201);
    expect(res.body.id_membresia).toBe(1);
  });

  test('POST /api/membresias (400) - error de validación', async () => {
    servicioFalso.crear.mockRejectedValue(new ErrorValidacion('Datos inválidos'));
    const res = await request(app).post('/api/membresias').send({ nombre: '' });
    expect(res.status).toBe(400);
  });

  test('GET /api/membresias (200) - lista membresías', async () => {
    servicioFalso.listar.mockResolvedValue([{ id_membresia: 1, nombre: 'Semanal' }]);
    const res = await request(app).get('/api/membresias');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test('GET /api/membresias/:id (404) - no encontrada', async () => {
    servicioFalso.obtenerPorId.mockRejectedValue(new ErrorNoEncontrado('No existe'));
    const res = await request(app).get('/api/membresias/99');
    expect(res.status).toBe(404);
  });

  test('DELETE /api/membresias/:id (204) - elimina correctamente', async () => {
    servicioFalso.eliminar.mockResolvedValue();
    const res = await request(app).delete('/api/membresias/1');
    expect(res.status).toBe(204);
  });

  test('DELETE /api/membresias/:id (409) - conflicto al eliminar', async () => {
    servicioFalso.eliminar.mockRejectedValue(new ErrorConflicto('Tiene pagos'));
    const res = await request(app).delete('/api/membresias/1');
    expect(res.status).toBe(409);
  });

  test('GET /api/membresias/:id (400) - rechaza id que no es entero positivo', async () => {
    const resTexto = await request(app).get('/api/membresias/abc');
    expect(resTexto.status).toBe(400);
    
    const resNegativo = await request(app).get('/api/membresias/-5');
    expect(resNegativo.status).toBe(400);
  });

  test('GET /api/membresias/:id (200) - encontrada', async () => {
    servicioFalso.obtenerPorId.mockResolvedValue({ id_membresia: 1, nombre: 'Semanal' });
    const res = await request(app).get('/api/membresias/1');
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Semanal');
  });

  test('PUT /api/membresias/:id (200) - actualiza correctamente', async () => {
    servicioFalso.actualizar.mockResolvedValue({ id_membresia: 1, nombre: 'Modificada' });
    const res = await request(app).put('/api/membresias/1').send({ nombre: 'Modificada', precio: 10, duracion_dias: 7 });
    expect(res.status).toBe(200);
  });

  test('PUT /api/membresias/:id (400) - falla si el id no es válido', async () => {
    const res = await request(app).put('/api/membresias/abc').send({ nombre: 'x', precio: 10, duracion_dias: 7 });
    expect(res.status).toBe(400);
  });
});