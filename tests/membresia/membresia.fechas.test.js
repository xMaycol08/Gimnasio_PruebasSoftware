const { calcularVencimiento } = require('../../src/modules/membresia/membresia.fechas');

describe('membresia.fechas (cálculo de vencimiento)', () => {
  test('calcula correctamente 7 días', () => {
    expect(calcularVencimiento('2026-03-01', 7)).toBe('2026-03-08');
  });

  test('calcula correctamente el fin de mes (30 días)', () => {
    expect(calcularVencimiento('2026-01-15', 30)).toBe('2026-02-14');
  });

  test('calcula correctamente el cruce de mes en febrero bisiesto', () => {
    expect(calcularVencimiento('2028-02-28', 1)).toBe('2028-02-29');
  });

  test('calcula correctamente el cruce de mes en febrero NO bisiesto', () => {
    expect(calcularVencimiento('2027-02-28', 1)).toBe('2027-03-01');
  });

  test('calcula correctamente el cambio de año', () => {
    expect(calcularVencimiento('2026-12-31', 1)).toBe('2027-01-01');
  });
});