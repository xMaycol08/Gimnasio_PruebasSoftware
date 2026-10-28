const { ErrorValidacion } = require('../../src/shared/errores');
const crearServicio = require('../../src/modules/reporte-vencimientos/reporte.vencimientos.servicio');

const pago = (id_cliente, estado, fecha_pago, fecha_vencimiento, nombre = `Cliente ${id_cliente}`) => ({
  id_cliente,
  nombre,
  email: `c${id_cliente}@gym.com`,
  estado,
  fecha_pago,
  fecha_vencimiento,
});

const crear = (pagos) =>
  crearServicio({
    repositorio: { listarPagosActivos: jest.fn().mockResolvedValue(pagos) },
    fechaActual: () => '2026-03-10',
  });

describe('porVencer', () => {
  const pagos = [
    pago(1, 'PAGADO', '2026-02-20', '2026-03-12'), // vence en 2 días
    pago(2, 'PAGADO', '2026-03-01', '2026-03-31'), // vence en 21 días
    pago(3, 'PAGADO', '2026-01-01', '2026-01-31'), // ya venció
    pago(4, 'PENDIENTE', '2026-03-05', '2026-04-04'), // pendiente: no es vigente
    pago(5, 'PAGADO', '2026-03-10', '2026-03-17'), // vence en 7 días (límite)
    pago(6, 'PAGADO', '2026-03-01', '2026-03-10'), // vence hoy
  ];

  test('por defecto lista los que vencen en 7 días o menos, ordenados por vencimiento', async () => {
    const resultado = await crear(pagos).porVencer();
    expect(resultado).toMatchObject({ fecha: '2026-03-10', dias: 7, total: 3 });
    expect(resultado.clientes.map((c) => [c.id_cliente, c.dias_restantes])).toEqual([
      [6, 0],
      [1, 2],
      [5, 7],
    ]);
  });

  test('un rango mayor incluye a más clientes', async () => {
    const resultado = await crear(pagos).porVencer({ dias: '30' });
    expect(resultado.clientes.map((c) => c.id_cliente)).toEqual([6, 1, 5, 2]);
  });

  test('si el cliente ya renovó, no aparece como por vencer', async () => {
    const renovado = [...pagos, pago(1, 'PAGADO', '2026-03-05', '2026-04-11')];
    const resultado = await crear(renovado).porVencer();
    expect(resultado.clientes.map((c) => c.id_cliente)).not.toContain(1);
  });

  test('acepta una fecha de consulta distinta de hoy', async () => {
    const resultado = await crear(pagos).porVencer({ dias: 1, fecha: '2026-03-11' });
    expect(resultado.clientes.map((c) => c.id_cliente)).toEqual([1]);
  });

  test.each([['0'], ['366'], ['abc'], ['1.5'], [-1], [0]])('rechaza dias = %p', async (dias) => {
    await expect(crear(pagos).porVencer({ dias })).rejects.toThrow(ErrorValidacion);
  });

  test('rechaza una fecha inválida', async () => {
    await expect(crear(pagos).porVencer({ fecha: '2026-02-30' })).rejects.toThrow(ErrorValidacion);
  });
});

describe('morosos', () => {
  const pagos = [
    pago(1, 'PAGADO', '2026-01-01', '2026-01-31'), // vencida
    pago(2, 'PAGADO', '2026-03-01', '2026-03-31'), // vigente
    pago(3, 'PENDIENTE', '2026-03-05', '2026-04-04'), // solo pendiente
    pago(4, 'PAGADO', '2026-01-01', '2026-01-31'), // vencida y además
    pago(4, 'PENDIENTE', '2026-03-05', '2026-04-04'), // con un pago pendiente
    pago(5, 'PAGADO', '2026-03-20', '2026-04-19'), // pagó por adelantado
    pago(6, 'PAGADO', '2026-02-01', '2026-03-10'), // vence hoy: aún no es moroso
  ];

  test('lista a los clientes sin membresía pagada que cubra la fecha, con su motivo', async () => {
    const resultado = await crear(pagos).morosos();
    expect(resultado.total).toBe(3);
    expect(resultado.clientes.map((c) => [c.id_cliente, c.motivo, c.ultimo_vencimiento])).toEqual([
      [1, 'MEMBRESIA_VENCIDA', '2026-01-31'],
      [3, 'PAGO_PENDIENTE', null],
      [4, 'PAGO_PENDIENTE', '2026-01-31'],
    ]);
  });

  test('un cliente que pagó por adelantado no es moroso', async () => {
    const resultado = await crear(pagos).morosos();
    expect(resultado.clientes.map((c) => c.id_cliente)).not.toContain(5);
  });

  test('con otra fecha cambia el resultado', async () => {
    const resultado = await crear(pagos).morosos({ fecha: '2026-03-11' });
    expect(resultado.clientes.map((c) => c.id_cliente)).toContain(6);
  });

  test('rechaza una fecha inválida', async () => {
    await expect(crear(pagos).morosos({ fecha: 'ayer' })).rejects.toThrow(ErrorValidacion);
  });

  test('sin pagos devuelve una lista vacía', async () => {
    expect(await crear([]).morosos()).toEqual({ fecha: '2026-03-10', total: 0, clientes: [] });
  });
});
