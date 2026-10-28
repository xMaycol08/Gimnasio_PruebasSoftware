// Integración: los 4 módulos reales y los reportes, con el esquema real sobre PostgreSQL simulado.
// Solo se verifican comportamientos que no dependen de los defectos intencionales.
const request = require('supertest');
const db = require('../../src/config/db');
const crearApp = require('../../src/app');
const { hoy, sumarDias } = require('../../src/shared/fechas');
const { crearBaseEnMemoria } = require('./baseEnMemoria');

jest.mock('../../src/config/db', () => ({ query: jest.fn() }));

describe('flujo completo entre módulos', () => {
  let api;
  const ids = {};

  beforeAll(() => {
    db.query.mockImplementation(crearBaseEnMemoria().query);
    api = request(crearApp());
  });

  const nuevoCliente = (cedula, email, nombre = 'Cliente de Prueba') =>
    api.post('/api/clientes').send({ nombre, cedula, telefono: '0999999999', email });

  test('1. crea una membresía y un cliente', async () => {
    const membresia = await api.post('/api/membresias').send({ nombre: 'mensual', precio: 30, duracion_dias: 30 });
    expect(membresia.status).toBe(201);
    ids.membresia = membresia.body.id_membresia;

    const cliente = await nuevoCliente('1710034065', 'ana@gym.com', 'Ana');
    expect(cliente.status).toBe(201);
    ids.cliente = cliente.body.id_cliente;
  });

  test('2. rechaza una cédula repetida con 409', async () => {
    const res = await nuevoCliente('1710034065', 'otra@gym.com');
    expect(res.status).toBe(409);
  });

  test('3. no deja entrar a un cliente sin pago (422)', async () => {
    const res = await api.post('/api/accesos/entrada').send({ id_cliente: ids.cliente });
    expect(res.status).toBe(422);
  });

  test('4. el pago calcula el vencimiento con la membresía real', async () => {
    const res = await api
      .post('/api/pagos')
      .send({ id_cliente: ids.cliente, id_membresia: ids.membresia, fecha_pago: hoy(), monto: 30 });
    expect(res.status).toBe(201);
    expect(res.body.fecha_vencimiento).toBe(sumarDias(hoy(), 30));
    expect(res.body.estado).toBe('PAGADO');
    ids.pago = res.body.id_pago;
  });

  test('5. rechaza un pago con monto distinto del precio (422) y con cliente inexistente (404)', async () => {
    const monto = await api
      .post('/api/pagos')
      .send({ id_cliente: ids.cliente, id_membresia: ids.membresia, fecha_pago: '2026-01-01', monto: 5 });
    expect(monto.status).toBe(422);

    const inexistente = await api
      .post('/api/pagos')
      .send({ id_cliente: 9999, id_membresia: ids.membresia, fecha_pago: '2026-01-01', monto: 30 });
    expect(inexistente.status).toBe(404);
  });

  test('6. con el pago, el cliente tiene la membresía vigente', async () => {
    const res = await api.get(`/api/pagos/vigencia/${ids.cliente}`);
    expect(res.status).toBe(200);
    expect(res.body.vigente).toBe(true);
  });

  test('7. con membresía vigente puede entrar y salir', async () => {
    const entrada = await api.post('/api/accesos/entrada').send({ id_cliente: ids.cliente });
    expect(entrada.status).toBe(201);
    expect(entrada.body.fecha_hora_salida).toBeNull();

    const salida = await api.post('/api/accesos/salida').send({ id_cliente: ids.cliente });
    expect(salida.status).toBe(200);
    expect(salida.body.fecha_hora_salida).not.toBeNull();
  });

  test('8. los reportes reflejan los datos reales', async () => {
    await nuevoCliente('0926687856', 'luis@gym.com', 'Luis');
    const luis = (await api.get('/api/clientes')).body.find((c) => c.email === 'luis@gym.com');
    const vencido = await api
      .post('/api/pagos')
      .send({ id_cliente: luis.id_cliente, id_membresia: ids.membresia, fecha_pago: '2020-01-01', monto: 30 });
    expect(vencido.status).toBe(201);

    const porVencer30 = await api.get('/api/reportes/vencimientos/por-vencer?dias=30');
    expect(porVencer30.body.clientes.map((c) => c.id_cliente)).toContain(ids.cliente);

    const porVencer7 = await api.get('/api/reportes/vencimientos/por-vencer?dias=7');
    expect(porVencer7.body.clientes.map((c) => c.id_cliente)).not.toContain(ids.cliente);

    const morosos = await api.get('/api/reportes/vencimientos/morosos');
    expect(morosos.body.clientes.map((c) => c.id_cliente)).toEqual([luis.id_cliente]);
    expect(morosos.body.clientes[0].motivo).toBe('MEMBRESIA_VENCIDA');

    const asistencia = await api.get('/api/reportes/asistencia');
    expect(asistencia.status).toBe(200);
    expect(asistencia.body.total_visitas).toBeGreaterThanOrEqual(1);
    expect(asistencia.body.clientes[0].id_cliente).toBe(ids.cliente);
  });

  test('9. un id que no es número responde 400 en clientes y membresías', async () => {
    expect((await api.get('/api/clientes/abc')).status).toBe(400);
    expect((await api.get('/api/membresias/abc')).status).toBe(400);
  });

  test('10. un pago anulado no puede volver a cambiar de estado (422)', async () => {
    const anulado = await api.patch(`/api/pagos/${ids.pago}/estado`).send({ estado: 'ANULADO' });
    expect(anulado.status).toBe(200);
    expect(anulado.body.estado).toBe('ANULADO');

    const reactivado = await api.patch(`/api/pagos/${ids.pago}/estado`).send({ estado: 'PAGADO' });
    expect(reactivado.status).toBe(422);
  });
});
