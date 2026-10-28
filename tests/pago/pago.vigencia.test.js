const { hoy, esVigente, vencimientoVigente } = require('../../src/modules/pago/pago.vigencia');
const { pagoEjemplo } = require('./helpers');

describe('hoy', () => {
  test('devuelve la fecha con formato YYYY-MM-DD', () => {
    expect(hoy()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('esVigente', () => {
  const pago = pagoEjemplo({ fecha_pago: '2026-03-01', fecha_vencimiento: '2026-03-31' });

  test('es vigente a mitad del periodo', () => {
    expect(esVigente(pago, '2026-03-15')).toBe(true);
  });

  test('no es vigente antes del pago', () => {
    expect(esVigente(pago, '2026-02-15')).toBe(false);
  });

  test('no es vigente mucho después del vencimiento', () => {
    expect(esVigente(pago, '2026-05-01')).toBe(false);
  });
});

describe('vencimientoVigente', () => {
  test('sin pagos devuelve null', () => {
    expect(vencimientoVigente([], '2026-03-15')).toBeNull();
  });

  test('devuelve el mayor vencimiento entre los pagos vigentes', () => {
    const pagos = [
      pagoEjemplo({ id_pago: 1, fecha_vencimiento: '2026-03-31' }),
      pagoEjemplo({ id_pago: 2, fecha_vencimiento: '2026-04-15' }),
    ];
    expect(vencimientoVigente(pagos, '2026-03-15')).toBe('2026-04-15');
  });

  test('ignora los pagos fuera de rango', () => {
    const pagos = [pagoEjemplo({ fecha_pago: '2026-01-01', fecha_vencimiento: '2026-01-31' })];
    expect(vencimientoVigente(pagos, '2026-03-15')).toBeNull();
  });
});
