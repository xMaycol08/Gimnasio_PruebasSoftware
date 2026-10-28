const request = require('supertest');
const express = require('express');
const crearRouter = require('../../src/modules/acceso/acceso.router');
const { manejadorErrores } = require('../../src/shared/manejadorErrores');
const {
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorConflicto,
  ErrorReglaNegocio,
} = require('../../src/shared/errores');

describe('acceso.router (endpoints HTTP con supertest)', () => {
  let servicioMock;
  let app;

  beforeEach(() => {
    servicioMock = {
      registrarEntrada: jest.fn(),
      registrarSalida: jest.fn(),
      listar: jest.fn(),
      obtenerDentro: jest.fn(),
    };

    app = express();
    app.use(express.json());
    app.use('/api/accesos', crearRouter(servicioMock));
    app.use(manejadorErrores);
  });

  describe('POST /api/accesos/entrada', () => {
    test('responde 201 al registrar entrada exitosa', async () => {
      const accesoCreado = {
        id_acceso: 1,
        id_cliente: 10,
        fecha_hora_entrada: '2026-03-01T10:00:00.000Z',
        fecha_hora_salida: null,
      };
      servicioMock.registrarEntrada.mockResolvedValueOnce(accesoCreado);

      const res = await request(app)
        .post('/api/accesos/entrada')
        .send({ id_cliente: 10, fecha_hora: '2026-03-01T10:00:00.000Z' });

      expect(res.status).toBe(201);
      expect(res.body.id_acceso).toBe(1);
      expect(servicioMock.registrarEntrada).toHaveBeenCalledWith(10, '2026-03-01T10:00:00.000Z');
    });

    test('responde 400 cuando falta o es inválido el id_cliente', async () => {
      servicioMock.registrarEntrada.mockRejectedValueOnce(
        new ErrorValidacion('El id_cliente es obligatorio')
      );

      const res = await request(app)
        .post('/api/accesos/entrada')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('El id_cliente es obligatorio');
    });

    test('responde 404 cuando el cliente no existe', async () => {
      servicioMock.registrarEntrada.mockRejectedValueOnce(
        new ErrorNoEncontrado('El cliente no existe')
      );

      const res = await request(app)
        .post('/api/accesos/entrada')
        .send({ id_cliente: 999 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('El cliente no existe');
    });

    test('responde 409 cuando ya tiene una entrada abierta', async () => {
      servicioMock.registrarEntrada.mockRejectedValueOnce(
        new ErrorConflicto('El cliente ya tiene una entrada abierta')
      );

      const res = await request(app)
        .post('/api/accesos/entrada')
        .send({ id_cliente: 10 });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('El cliente ya tiene una entrada abierta');
    });

    test('responde 422 cuando la membresía no está vigente', async () => {
      servicioMock.registrarEntrada.mockRejectedValueOnce(
        new ErrorReglaNegocio('Membresía vencida o inexistente')
      );

      const res = await request(app)
        .post('/api/accesos/entrada')
        .send({ id_cliente: 10 });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('Membresía vencida o inexistente');
    });
  });

  describe('POST /api/accesos/salida', () => {
    test('responde 200 con el acceso cerrado y permanencia_minutos', async () => {
      const accesoSalida = {
        id_acceso: 1,
        id_cliente: 10,
        fecha_hora_entrada: '2026-03-01T10:00:00.000Z',
        fecha_hora_salida: '2026-03-01T11:00:00.000Z',
        permanencia_minutos: 60,
      };
      servicioMock.registrarSalida.mockResolvedValueOnce(accesoSalida);

      const res = await request(app)
        .post('/api/accesos/salida')
        .send({ id_cliente: 10, fecha_hora: '2026-03-01T11:00:00.000Z' });

      expect(res.status).toBe(200);
      expect(res.body.permanencia_minutos).toBe(60);
      expect(servicioMock.registrarSalida).toHaveBeenCalledWith(10, '2026-03-01T11:00:00.000Z');
    });

    test('responde 400 con datos de entrada inválidos', async () => {
      servicioMock.registrarSalida.mockRejectedValueOnce(
        new ErrorValidacion('El id_cliente debe ser un número entero positivo')
      );

      const res = await request(app)
        .post('/api/accesos/salida')
        .send({ id_cliente: 'invalido' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('El id_cliente debe ser un número entero positivo');
    });

    test('responde 404 si el cliente no existe', async () => {
      servicioMock.registrarSalida.mockRejectedValueOnce(
        new ErrorNoEncontrado('El cliente no existe')
      );

      const res = await request(app)
        .post('/api/accesos/salida')
        .send({ id_cliente: 999 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('El cliente no existe');
    });

    test('responde 409 si el cliente no tiene una entrada abierta', async () => {
      servicioMock.registrarSalida.mockRejectedValueOnce(
        new ErrorConflicto('El cliente no tiene una entrada abierta')
      );

      const res = await request(app)
        .post('/api/accesos/salida')
        .send({ id_cliente: 10 });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('El cliente no tiene una entrada abierta');
    });

    test('responde 422 si la salida es anterior a la entrada', async () => {
      servicioMock.registrarSalida.mockRejectedValueOnce(
        new ErrorReglaNegocio('La fecha y hora de salida no puede ser anterior a la de entrada')
      );

      const res = await request(app)
        .post('/api/accesos/salida')
        .send({ id_cliente: 10, fecha_hora: '2026-03-01T09:00:00.000Z' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe(
        'La fecha y hora de salida no puede ser anterior a la de entrada'
      );
    });
  });

  describe('GET /api/accesos', () => {
    test('responde 200 con la lista de accesos', async () => {
      servicioMock.listar.mockResolvedValueOnce([
        { id_acceso: 1, id_cliente: 1 },
        { id_acceso: 2, id_cliente: 2 },
      ]);

      const res = await request(app).get('/api/accesos');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(servicioMock.listar).toHaveBeenCalledWith({ idCliente: undefined });
    });

    test('responde 200 con filtro opcional por ?id_cliente=', async () => {
      servicioMock.listar.mockResolvedValueOnce([
        { id_acceso: 1, id_cliente: 5 },
      ]);

      const res = await request(app).get('/api/accesos?id_cliente=5');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(servicioMock.listar).toHaveBeenCalledWith({ idCliente: '5' });
    });

    test('responde 400 si el parámetro id_cliente es inválido', async () => {
      servicioMock.listar.mockRejectedValueOnce(
        new ErrorValidacion('El id_cliente debe ser un número entero positivo')
      );

      const res = await request(app).get('/api/accesos?id_cliente=invalido');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('El id_cliente debe ser un número entero positivo');
    });
  });

  describe('GET /api/accesos/dentro', () => {
    test('responde 200 con la lista de clientes dentro ahora', async () => {
      servicioMock.obtenerDentro.mockResolvedValueOnce([
        {
          id_acceso: 10,
          id_cliente: 3,
          nombre: 'Maria Gomez',
          cedula: '1720000002',
          fecha_hora_entrada: '2026-03-01T16:00:00.000Z',
          fecha_hora_salida: null,
        },
      ]);

      const res = await request(app).get('/api/accesos/dentro');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].nombre).toBe('Maria Gomez');
      expect(servicioMock.obtenerDentro).toHaveBeenCalledTimes(1);
    });
  });
});
