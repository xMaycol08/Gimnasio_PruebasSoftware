const { esVigente, vencimientoVigente } = require('../../src/modules/pago/pago.vigencia');
const { pagoEjemplo } = require('./helpers');

// Valores límite de la vigencia: fecha de pago y fecha de vencimiento inclusive.
describe('esVigente: valores límite', () => {
  const pago = pagoEjemplo({ fecha_pago: '2026-03-01', fecha_vencimiento: '2026-03-31' });

  test.each([
    ['el día anterior al pago', '2026-02-28', false],
    ['el día del pago', '2026-03-01', true],
    ['un día antes del vencimiento', '2026-03-30', true],
    ['el día del vencimiento (último día vigente)', '2026-03-31', true],
    ['el día siguiente al vencimiento', '2026-04-01', false],
  ])('%s', (_descripcion, fecha, esperado) => {
    expect(esVigente(pago, fecha)).toBe(esperado);
  });
});

// Tabla de decisión: estado del pago x fecha dentro o fuera del periodo.
describe('esVigente: tabla de decisión estado x fecha', () => {
  const dentro = '2026-03-15';
  const fuera = '2026-06-15';

  test.each([
    ['PAGADO', dentro, true],
    ['PAGADO', fuera, false],
    ['PENDIENTE', dentro, false],
    ['PENDIENTE', fuera, false],
    ['ANULADO', dentro, false],
    ['ANULADO', fuera, false],
  ])('estado %s con fecha %s -> vigente: %s', (estado, fecha, esperado) => {
    expect(esVigente(pagoEjemplo({ estado }), fecha)).toBe(esperado);
  });

  test('vencimientoVigente ignora los pagos anulados y pendientes', () => {
    const pagos = [
      pagoEjemplo({ id_pago: 1, estado: 'ANULADO', fecha_vencimiento: '2026-04-30' }),
      pagoEjemplo({ id_pago: 2, estado: 'PENDIENTE', fecha_vencimiento: '2026-05-30' }),
    ];
    expect(vencimientoVigente(pagos, '2026-03-15')).toBeNull();
  });
});
