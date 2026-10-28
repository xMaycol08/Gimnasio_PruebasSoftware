const { calcularPermanenciaMinutos } = require('../../src/modules/acceso/acceso.permanencia');

describe('acceso.permanencia (cálculo de permanencia en minutos)', () => {
  describe('Valores límite', () => {
    test('salida igual a la entrada resulta en 0 minutos', () => {
      const entrada = '2026-03-01T10:00:00.000Z';
      const salida = '2026-03-01T10:00:00.000Z';
      expect(calcularPermanenciaMinutos(entrada, salida)).toBe(0);
    });

    test('permanencia de exactamente 59 minutos', () => {
      const entrada = '2026-03-01T10:00:00.000Z';
      const salida = '2026-03-01T10:59:00.000Z';
      expect(calcularPermanenciaMinutos(entrada, salida)).toBe(59);
    });

    test('permanencia de exactamente 60 minutos', () => {
      const entrada = '2026-03-01T10:00:00.000Z';
      const salida = '2026-03-01T11:00:00.000Z';
      expect(calcularPermanenciaMinutos(entrada, salida)).toBe(60);
    });

    test('permanencia de exactamente 61 minutos', () => {
      const entrada = '2026-03-01T10:00:00.000Z';
      const salida = '2026-03-01T11:01:00.000Z';
      expect(calcularPermanenciaMinutos(entrada, salida)).toBe(61);
    });
  });

  describe('Cruce de medianoche y redondeo hacia abajo', () => {
    test('cruce de medianoche: entrar a las 23:30 y salir a las 00:15 del día siguiente son 45 minutos', () => {
      const entrada = '2026-03-01T23:30:00.000Z';
      const salida = '2026-03-02T00:15:00.000Z';
      expect(calcularPermanenciaMinutos(entrada, salida)).toBe(45);
    });

    test('redondeo hacia abajo: 45 minutos con 59 segundos debe ser 45 minutos', () => {
      const entrada = '2026-03-01T14:00:00.000Z';
      const salida = '2026-03-01T14:45:59.000Z';
      expect(calcularPermanenciaMinutos(entrada, salida)).toBe(45);
    });

    test('funciona correctamente recibiendo objetos Date', () => {
      const entrada = new Date('2026-03-01T08:00:00.000Z');
      const salida = new Date('2026-03-01T09:30:00.000Z');
      expect(calcularPermanenciaMinutos(entrada, salida)).toBe(90);
    });
  });

  describe('Casos de error', () => {
    test('lanza RangeError si la salida es anterior a la entrada', () => {
      const entrada = '2026-03-01T11:00:00.000Z';
      const salida = '2026-03-01T10:00:00.000Z';
      expect(() => calcularPermanenciaMinutos(entrada, salida)).toThrow(RangeError);
    });

    test('lanza TypeError si las fechas son inválidas', () => {
      expect(() => calcularPermanenciaMinutos('fecha-invalida', '2026-03-01T10:00:00Z')).toThrow(TypeError);
      expect(() => calcularPermanenciaMinutos('2026-03-01T10:00:00Z', 'invalida')).toThrow(TypeError);
    });
  });
});
