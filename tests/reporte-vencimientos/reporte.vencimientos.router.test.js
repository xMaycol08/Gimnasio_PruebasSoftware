const request = require('supertest');
const express = require('express');
const crearRouter = require('../../src/modules/reporte-vencimientos/reporte.vencimientos.router');
const crearServicio = require('../../src/modules/reporte-vencimientos/reporte.vencimientos.servicio');
const { manejadorErrores } = require('../../src/shared/manejadorErrores');

const pagos = [
  { id_cliente: 1, nombre: 'Ana', email: 'a@gym.com', estado: 'PAGADO', fecha_pago: '2026-03-01', fecha_vencimiento: '2026-03-12' },
  { id_cliente: 2, nombre: 'Luis', email: 'l@gym.com', estado: 'PAGADO', fecha_pago: '2026-01-01', fecha_vencimiento: '2026-01-31' },
];

const app = express();
app.use(
  '/',
  crearRouter(
    crearServicio({
      repositorio: { listarPagosActivos: async () => pagos },
      fechaActual: () => '2026-03-10',
    })
  )
);
app.use(manejadorErrores);

describe('reporte de vencimientos', () => {
  test('GET /por-vencer responde 200 con los clientes', async () => {
    const res = await request(app).get('/por-vencer?dias=5');
    expect(res.status).toBe(200);
    expect(res.body.clientes).toHaveLength(1);
    expect(res.body.clientes[0].id_cliente).toBe(1);
  });

  test('GET /por-vencer con dias inválido responde 400', async () => {
    expect((await request(app).get('/por-vencer?dias=0')).status).toBe(400);
  });

  test('GET /morosos responde 200', async () => {
    const res = await request(app).get('/morosos');
    expect(res.status).toBe(200);
    expect(res.body.clientes.map((c) => c.id_cliente)).toEqual([2]);
  });

  test('GET /morosos con fecha inválida responde 400', async () => {
    expect((await request(app).get('/morosos?fecha=hoy')).status).toBe(400);
  });
});
