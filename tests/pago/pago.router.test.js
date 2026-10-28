const request = require('supertest');
const express = require('express');
const crearRouter = require('../../src/modules/pago/pago.router');
const { manejadorErrores } = require('../../src/shared/manejadorErrores');
const { crearServicioDePrueba, pagoEjemplo } = require('./helpers');

const crearApp = (opciones) => {
  const { servicio } = crearServicioDePrueba(opciones);
  const app = express();
  app.use(express.json());
  app.use('/api/pagos', crearRouter(servicio));
  app.use(manejadorErrores);
  return app;
};

const cuerpo = { id_cliente: 1, id_membresia: 1, fecha_pago: '2026-03-01', monto: 30 };

describe('POST /api/pagos', () => {
  test('201 con el pago creado', async () => {
    const res = await request(crearApp()).post('/api/pagos').send(cuerpo);
    expect(res.status).toBe(201);
    expect(res.body.fecha_vencimiento).toBe('2026-03-31');
  });

  test('400 con datos inválidos', async () => {
    const res = await request(crearApp()).post('/api/pagos').send({ ...cuerpo, fecha_pago: '2026-02-30' });
    expect(res.status).toBe(400);
  });

  test('400 sin cuerpo', async () => {
    const res = await request(crearApp()).post('/api/pagos');
    expect(res.status).toBe(400);
  });

  test('404 con cliente inexistente', async () => {
    const res = await request(crearApp()).post('/api/pagos').send({ ...cuerpo, id_cliente: 99 });
    expect(res.status).toBe(404);
  });

  test('409 con pago duplicado', async () => {
    const app = crearApp({ pagos: [pagoEjemplo()] });
    const res = await request(app).post('/api/pagos').send(cuerpo);
    expect(res.status).toBe(409);
  });

  test('422 con monto distinto del precio', async () => {
    const res = await request(crearApp()).post('/api/pagos').send({ ...cuerpo, monto: 10 });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/pagos', () => {
  const pagos = [pagoEjemplo({ id_pago: 1, id_cliente: 1 }), pagoEjemplo({ id_pago: 2, id_cliente: 2 })];

  test('200 con todos los pagos', async () => {
    const res = await request(crearApp({ pagos })).get('/api/pagos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('200 filtrando por id_cliente', async () => {
    const res = await request(crearApp({ pagos })).get('/api/pagos?id_cliente=2');
    expect(res.body).toHaveLength(1);
  });

  test('400 con id_cliente inválido', async () => {
    const res = await request(crearApp({ pagos })).get('/api/pagos?id_cliente=abc');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/pagos/:id', () => {
  test('200 con el pago', async () => {
    const res = await request(crearApp({ pagos: [pagoEjemplo()] })).get('/api/pagos/1');
    expect(res.status).toBe(200);
    expect(res.body.id_pago).toBe(1);
  });

  test('404 si no existe', async () => {
    const res = await request(crearApp()).get('/api/pagos/99');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/pagos/:id/estado', () => {
  test('200 al anular un pago', async () => {
    const res = await request(crearApp({ pagos: [pagoEjemplo()] }))
      .patch('/api/pagos/1/estado')
      .send({ estado: 'ANULADO' });
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('ANULADO');
  });

  test('400 con estado inválido y 400 sin cuerpo', async () => {
    const app = crearApp({ pagos: [pagoEjemplo()] });
    expect((await request(app).patch('/api/pagos/1/estado').send({ estado: 'X' })).status).toBe(400);
    expect((await request(app).patch('/api/pagos/1/estado')).status).toBe(400);
  });

  test('404 si el pago no existe', async () => {
    const res = await request(crearApp()).patch('/api/pagos/99/estado').send({ estado: 'ANULADO' });
    expect(res.status).toBe(404);
  });

  test('422 si la transición no está permitida', async () => {
    const app = crearApp({ pagos: [pagoEjemplo({ estado: 'ANULADO' })] });
    const res = await request(app).patch('/api/pagos/1/estado').send({ estado: 'PAGADO' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/pagos/vigencia/:idCliente', () => {
  const pagos = [pagoEjemplo({ fecha_pago: '2026-03-01', fecha_vencimiento: '2026-03-31' })];

  test('200 vigente dentro del periodo', async () => {
    const res = await request(crearApp({ pagos })).get('/api/pagos/vigencia/1?fecha=2026-03-15');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ vigente: true, fecha_vencimiento: '2026-03-31' });
  });

  test('200 no vigente fuera del periodo', async () => {
    const res = await request(crearApp({ pagos })).get('/api/pagos/vigencia/1?fecha=2026-07-01');
    expect(res.body.vigente).toBe(false);
  });

  test('sin fecha usa hoy', async () => {
    const res = await request(crearApp({ pagos, hoy: () => '2026-03-10' })).get('/api/pagos/vigencia/1');
    expect(res.body.vigente).toBe(true);
  });

  test('404 con cliente inexistente y 400 con fecha inválida', async () => {
    const app = crearApp({ pagos });
    expect((await request(app).get('/api/pagos/vigencia/99?fecha=2026-03-15')).status).toBe(404);
    expect((await request(app).get('/api/pagos/vigencia/1?fecha=mañana')).status).toBe(400);
  });
});
