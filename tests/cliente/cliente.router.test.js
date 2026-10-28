
const request = require('supertest');
const express = require('express');

jest.mock('../../src/modules/cliente/cliente.servicio', () => ({
  crearServicio: jest.fn(),
}));

const { crearServicio } = require('../../src/modules/cliente/cliente.servicio');
const { manejadorErrores } = require('../../src/shared/manejadorErrores');
const { ErrorValidacion } = require('../../src/shared/errores');

const cliente = {
  id_cliente: 1,
  nombre: 'Juan Perez',
  cedula: '1710034065',
  telefono: '0991234567',
  email: 'juan@example.com',
};

const servicio = {
  listar: jest.fn(),
  obtenerPorId: jest.fn(),
  crear: jest.fn(),
  actualizar: jest.fn(),
  eliminar: jest.fn(),
};

crearServicio.mockReturnValue(servicio);

const router = require('../../src/modules/cliente/cliente.router');

describe('Rutas de clientes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    servicio.listar.mockResolvedValue([cliente]);
    servicio.obtenerPorId.mockResolvedValue(cliente);
    servicio.crear.mockResolvedValue(cliente);
    servicio.actualizar.mockResolvedValue(cliente);
    servicio.eliminar.mockResolvedValue(undefined);

    app = express();
    app.use(express.json());
    app.use('/api/clientes', router);
    app.use(manejadorErrores);
  });

  test('GET /api/clientes devuelve la lista', async () => {
    const respuesta = await request(app).get('/api/clientes');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([cliente]);
  });

  test('GET /api/clientes/1 devuelve un cliente', async () => {
    const respuesta = await request(app).get('/api/clientes/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual(cliente);
  });

  test.each(['abc', '0', '-1', '1.5'])(
    'GET /api/clientes/%s devuelve 400 para un ID inválido',
    async (id) => {
      servicio.obtenerPorId.mockRejectedValue(
        new ErrorValidacion('El id debe ser un entero positivo')
      );

      const respuesta = await request(app).get(`/api/clientes/${id}`);

      expect(respuesta.status).toBe(400);
    }
  );

  test('POST /api/clientes crea un cliente', async () => {
    const respuesta = await request(app)
      .post('/api/clientes')
      .send({
        nombre: 'Juan Perez',
        cedula: '1710034065',
        telefono: '0991234567',
        email: 'juan@example.com',
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toEqual(cliente);
  });

  test('PUT /api/clientes/1 actualiza un cliente', async () => {
    const respuesta = await request(app)
      .put('/api/clientes/1')
      .send({
        nombre: 'Juan Perez',
        cedula: '1710034065',
        telefono: '0991234567',
        email: 'juan@example.com',
      });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual(cliente);
  });

  test('DELETE /api/clientes/1 devuelve 204', async () => {
    const respuesta = await request(app).delete('/api/clientes/1');

    expect(respuesta.status).toBe(204);
    expect(respuesta.text).toBe('');
  });

  test('devuelve 404 cuando el cliente no existe', async () => {
    const { ErrorNoEncontrado } = require('../../src/shared/errores');

    servicio.obtenerPorId.mockRejectedValue(
      new ErrorNoEncontrado('El cliente no existe')
    );

    const respuesta = await request(app).get('/api/clientes/99');

    expect(respuesta.status).toBe(404);
  });

  test('devuelve 409 cuando existe un duplicado', async () => {
    const { ErrorConflicto } = require('../../src/shared/errores');

    servicio.crear.mockRejectedValue(
      new ErrorConflicto('El correo ya está registrado')
    );

    const respuesta = await request(app)
      .post('/api/clientes')
      .send({
        nombre: 'Juan Perez',
        cedula: '1710034065',
        email: 'juan@example.com',
      });

    expect(respuesta.status).toBe(409);
  });
});
