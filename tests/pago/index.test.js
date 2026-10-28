const crearServicio = require('../../src/modules/pago/pago.servicio');
const { crearRepositorioEnMemoria, sumarDias, MENSUAL } = require('./helpers');

// Los módulos de los compañeros se simulan: así la prueba no depende de que ya estén fusionados.
jest.mock(
  '../../src/modules/cliente',
  () => ({ clienteExiste: jest.fn().mockResolvedValue(true) }),
  { virtual: true }
);
jest.mock(
  '../../src/modules/membresia',
  () => ({
    obtenerPorId: jest.fn().mockResolvedValue({ id_membresia: 1, nombre: 'mensual', precio: 30, duracion_dias: 30 }),
    calcularVencimiento: (fecha, dias) => require('./helpers').sumarDias(fecha, dias),
  }),
  { virtual: true }
);

describe('módulo pago', () => {
  test('index exporta basePath, router y el contrato público', () => {
    const modulo = require('../../src/modules/pago');
    expect(modulo.basePath).toBe('/api/pagos');
    expect(typeof modulo.router).toBe('function');
    expect(typeof modulo.tieneMembresiaVigente).toBe('function');
  });

  test('por defecto carga los módulos Cliente y Membresía de forma perezosa', async () => {
    const servicio = crearServicio({ repositorio: crearRepositorioEnMemoria() });
    const pago = await servicio.registrar({
      id_cliente: 1,
      id_membresia: 1,
      fecha_pago: '2026-03-01',
      monto: MENSUAL.precio,
    });
    expect(pago.fecha_vencimiento).toBe(sumarDias('2026-03-01', 30));
  });
});
