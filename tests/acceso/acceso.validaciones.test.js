const {
  validarIdCliente,
  validarFechaHora,
  validarOrdenFechas,
  extraerFechaYMD,
} = require('../../src/modules/acceso/acceso.validaciones');
const { ErrorValidacion, ErrorReglaNegocio } = require('../../src/shared/errores');

describe('acceso.validaciones', () => {
  describe('validarIdCliente', () => {
    test('acepta un número entero positivo', () => {
      expect(validarIdCliente(1)).toBe(1);
      expect(validarIdCliente(150)).toBe(150);
    });

    test('acepta un string numérico entero positivo y lo convierte a número', () => {
      expect(validarIdCliente('42')).toBe(42);
    });

    test('lanza ErrorValidacion si id_cliente no se envía o está vacío', () => {
      expect(() => validarIdCliente()).toThrow(ErrorValidacion);
      expect(() => validarIdCliente(null)).toThrow(ErrorValidacion);
      expect(() => validarIdCliente('')).toThrow(ErrorValidacion);
    });

    test('lanza ErrorValidacion si id_cliente no es un número entero positivo', () => {
      expect(() => validarIdCliente(0)).toThrow(ErrorValidacion);
      expect(() => validarIdCliente(-5)).toThrow(ErrorValidacion);
      expect(() => validarIdCliente(3.14)).toThrow(ErrorValidacion);
      expect(() => validarIdCliente('abc')).toThrow(ErrorValidacion);
    });
  });

  describe('validarFechaHora', () => {
    test('devuelve una instancia de Date actual si no se proporciona', () => {
      const antes = Date.now();
      const resultado = validarFechaHora();
      const despues = Date.now();
      expect(resultado).toBeInstanceOf(Date);
      expect(resultado.getTime()).toBeGreaterThanOrEqual(antes);
      expect(resultado.getTime()).toBeLessThanOrEqual(despues);
    });

    test('devuelve Date actual cuando se pasa null o string vacío', () => {
      expect(validarFechaHora(null)).toBeInstanceOf(Date);
      expect(validarFechaHora('')).toBeInstanceOf(Date);
    });

    test('acepta un Date válido y lo retorna', () => {
      const fecha = new Date('2026-03-01T14:30:00.000Z');
      expect(validarFechaHora(fecha)).toEqual(fecha);
    });

    test('lanza ErrorValidacion si se pasa una instancia de Date inválida', () => {
      const fechaInvalida = new Date('fecha_invalida');
      expect(() => validarFechaHora(fechaInvalida)).toThrow(ErrorValidacion);
    });

    test('acepta un string en formato ISO 8601', () => {
      const iso = '2026-03-01T14:30:00.000Z';
      const res = validarFechaHora(iso);
      expect(res).toBeInstanceOf(Date);
      expect(res.toISOString()).toBe(iso);
    });

    test('lanza ErrorValidacion si el string no es una fecha válida', () => {
      expect(() => validarFechaHora('no-es-una-fecha')).toThrow(ErrorValidacion);
    });

    test('lanza ErrorValidacion si el tipo no es string ni Date', () => {
      expect(() => validarFechaHora(12345678)).toThrow(ErrorValidacion);
      expect(() => validarFechaHora(true)).toThrow(ErrorValidacion);
    });
  });

  describe('validarOrdenFechas', () => {
    test('no lanza error cuando salida es posterior a entrada', () => {
      expect(() =>
        validarOrdenFechas('2026-03-01T10:00:00Z', '2026-03-01T11:00:00Z')
      ).not.toThrow();
    });

    test('no lanza error cuando salida es igual a entrada', () => {
      expect(() =>
        validarOrdenFechas('2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z')
      ).not.toThrow();
    });

    test('lanza ErrorReglaNegocio (422) cuando salida es anterior a entrada', () => {
      expect(() =>
        validarOrdenFechas('2026-03-01T10:00:00Z', '2026-03-01T09:59:00Z')
      ).toThrow(ErrorReglaNegocio);
    });
  });

  describe('extraerFechaYMD', () => {
    test('extrae la fecha en formato YYYY-MM-DD', () => {
      expect(extraerFechaYMD(new Date('2026-03-01T14:30:00.000Z'))).toBe('2026-03-01');
      expect(extraerFechaYMD('2026-12-31T23:59:59.000Z')).toBe('2026-12-31');
    });
  });
});
