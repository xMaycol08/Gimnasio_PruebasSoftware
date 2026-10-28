const { hoy, esFechaValida, sumarDias, diasEntre } = require('../../src/shared/fechas');

describe('fechas compartidas', () => {
  test('hoy devuelve YYYY-MM-DD', () => {
    expect(hoy()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test.each([['2026-03-01'], ['2028-02-29'], ['2026-12-31']])('esFechaValida acepta %p', (fecha) => {
    expect(esFechaValida(fecha)).toBe(true);
  });

  test.each([['2026-02-30'], ['2027-02-29'], ['2026-13-01'], ['2026-3-1'], [''], [null], [20260301]])(
    'esFechaValida rechaza %p',
    (fecha) => {
      expect(esFechaValida(fecha)).toBe(false);
    }
  );

  test.each([
    ['2026-01-31', 30, '2026-03-02'],
    ['2028-02-28', 1, '2028-02-29'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-03-10', -9, '2026-03-01'],
    ['2026-03-10', 0, '2026-03-10'],
  ])('sumarDias(%s, %i) = %s', (fecha, dias, esperado) => {
    expect(sumarDias(fecha, dias)).toBe(esperado);
  });

  test('diasEntre cuenta días calendario', () => {
    expect(diasEntre('2026-03-01', '2026-03-31')).toBe(30);
    expect(diasEntre('2026-03-31', '2026-03-01')).toBe(-30);
    expect(diasEntre('2028-02-28', '2028-03-01')).toBe(2);
  });
});
