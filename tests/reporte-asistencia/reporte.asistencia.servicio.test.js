const { ErrorValidacion } = require('../../src/shared/errores');
const crearServicio = require('../../src/modules/reporte-asistencia/reporte.asistencia.servicio');

const acceso = (id_cliente, entrada, salida, nombre = `Cliente ${id_cliente}`) => ({
  id_cliente,
  nombre,
  fecha_hora_entrada: new Date(entrada),
  fecha_hora_salida: salida ? new Date(salida) : null,
});

const crear = (accesos) => {
  const repositorio = { listarAccesos: jest.fn().mockResolvedValue(accesos) };
  const servicio = crearServicio({ repositorio, fechaActual: () => '2026-03-31' });
  return { servicio, repositorio };
};

describe('asistencia', () => {
  const accesos = [
    acceso(1, '2026-03-02T10:00:00Z', '2026-03-02T11:00:00Z'),
    acceso(1, '2026-03-03T10:00:00Z', '2026-03-03T10:45:59Z'),
    acceso(2, '2026-03-02T09:00:00Z', '2026-03-02T09:30:00Z'),
    acceso(2, '2026-03-04T09:00:00Z', null),
    acceso(2, '2026-03-05T09:00:00Z', '2026-03-05T09:10:00Z'),
  ];

  test('agrupa visitas y minutos por cliente, ordenado por visitas', async () => {
    const { servicio } = crear(accesos);
    const resultado = await servicio.asistencia({ desde: '2026-03-01', hasta: '2026-03-31' });
    expect(resultado.total_visitas).toBe(5);
    expect(resultado.clientes).toEqual([
      { id_cliente: 2, nombre: 'Cliente 2', visitas: 3, minutos_totales: 40, accesos_abiertos: 1 },
      { id_cliente: 1, nombre: 'Cliente 1', visitas: 2, minutos_totales: 105, accesos_abiertos: 0 },
    ]);
  });

  test('los minutos se redondean hacia abajo (45 min 59 s son 45 min)', async () => {
    const { servicio } = crear([acceso(1, '2026-03-03T10:00:00Z', '2026-03-03T10:45:59Z')]);
    const resultado = await servicio.asistencia({ desde: '2026-03-01', hasta: '2026-03-31' });
    expect(resultado.clientes[0].minutos_totales).toBe(45);
  });

  test('consulta al repositorio con "hasta" incluido (día siguiente como límite)', async () => {
    const { servicio, repositorio } = crear([]);
    await servicio.asistencia({ desde: '2026-03-01', hasta: '2026-03-31' });
    expect(repositorio.listarAccesos).toHaveBeenCalledWith('2026-03-01', '2026-04-01');
  });

  test('por defecto usa los últimos 30 días terminando hoy', async () => {
    const { servicio } = crear([]);
    expect(await servicio.asistencia()).toMatchObject({
      desde: '2026-03-02',
      hasta: '2026-03-31',
      total_visitas: 0,
      clientes: [],
    });
  });

  test.each([
    [{ desde: '2026-02-30', hasta: '2026-03-31' }],
    [{ desde: '2026-03-01', hasta: 'mañana' }],
    [{ desde: '2026-04-01', hasta: '2026-03-01' }],
    [{ desde: '2025-01-01', hasta: '2026-03-31' }],
  ])('rechaza el rango %p', async (rango) => {
    const { servicio } = crear([]);
    await expect(servicio.asistencia(rango)).rejects.toThrow(ErrorValidacion);
  });

  test('un solo día es un rango válido', async () => {
    const { servicio } = crear([]);
    await expect(servicio.asistencia({ desde: '2026-03-10', hasta: '2026-03-10' })).resolves.toBeDefined();
  });
});
