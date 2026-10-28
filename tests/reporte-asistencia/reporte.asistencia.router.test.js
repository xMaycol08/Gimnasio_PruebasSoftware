const request = require('supertest');
const express = require('express');
const crearRouter = require('../../src/modules/reporte-asistencia/reporte.asistencia.router');
const crearServicio = require('../../src/modules/reporte-asistencia/reporte.asistencia.servicio');
const { manejadorErrores } = require('../../src/shared/manejadorErrores');

const app = express();
app.use(
  '/',
  crearRouter(
    crearServicio({
      repositorio: {
        listarAccesos: async () => [
          { id_cliente: 1, nombre: 'Ana', fecha_hora_entrada: new Date('2026-03-02T10:00:00Z'), fecha_hora_salida: new Date('2026-03-02T11:00:00Z') },
        ],
      },
      fechaActual: () => '2026-03-31',
    })
  )
);
app.use(manejadorErrores);

describe('reporte de asistencia', () => {
  test('GET / responde 200 con el resumen', async () => {
    const res = await request(app).get('/?desde=2026-03-01&hasta=2026-03-31');
    expect(res.status).toBe(200);
    expect(res.body.total_visitas).toBe(1);
    expect(res.body.clientes[0].minutos_totales).toBe(60);
  });

  test('GET / sin parámetros usa el rango por defecto', async () => {
    expect((await request(app).get('/')).status).toBe(200);
  });

  test('GET / con rango inválido responde 400', async () => {
    expect((await request(app).get('/?desde=2026-04-01&hasta=2026-03-01')).status).toBe(400);
  });
});
