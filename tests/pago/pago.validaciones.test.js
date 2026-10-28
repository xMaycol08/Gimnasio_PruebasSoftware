const { ErrorValidacion, ErrorReglaNegocio } = require('../../src/shared/errores');
const {
  validarId,
  validarFecha,
  validarMonto,
  validarEstado,
  validarDatosPago,
  validarTransicion,
} = require('../../src/modules/pago/pago.validaciones');

describe('validarId', () => {
  test.each([[1, 1], ['7', 7], [999999, 999999]])('acepta %p', (entrada, esperado) => {
    expect(validarId(entrada, 'id')).toBe(esperado);
  });

  test.each([[0], [-1], [1.5], ['abc'], [''], [null], [undefined], ['1.5']])('rechaza %p', (entrada) => {
    expect(() => validarId(entrada, 'id_cliente')).toThrow(ErrorValidacion);
  });

  test('el mensaje indica el campo', () => {
    expect(() => validarId(0, 'id_cliente')).toThrow('id_cliente debe ser un entero positivo');
  });
});

describe('validarFecha', () => {
  test.each([['2026-03-01'], ['2028-02-29'], ['2026-12-31']])('acepta %p', (fecha) => {
    expect(validarFecha(fecha, 'fecha_pago')).toBe(fecha);
  });

  test.each([['2026-02-30'], ['2026-13-01'], ['2026-3-1'], ['01/03/2026'], [''], [20260301], [null]])(
    'rechaza %p',
    (fecha) => {
      expect(() => validarFecha(fecha, 'fecha_pago')).toThrow(ErrorValidacion);
    }
  );

  test('29 de febrero solo es válido en año bisiesto', () => {
    expect(() => validarFecha('2027-02-29', 'fecha_pago')).toThrow('no es una fecha válida');
  });
});

describe('validarMonto (valores límite)', () => {
  test.each([[0.01], [1], [30], [45.5], [999999.99]])('acepta %p', (monto) => {
    expect(validarMonto(monto)).toBe(monto);
  });

  test.each([[0], [-5], [1000000], [10.123], ['30'], [NaN], [Infinity], [null]])('rechaza %p', (monto) => {
    expect(() => validarMonto(monto)).toThrow(ErrorValidacion);
  });
});

describe('validarEstado', () => {
  test.each([['PAGADO'], ['PENDIENTE'], ['ANULADO']])('acepta %p', (estado) => {
    expect(validarEstado(estado)).toBe(estado);
  });

  test.each([['pagado'], ['OTRO'], [''], [undefined], [1]])('rechaza %p', (estado) => {
    expect(() => validarEstado(estado)).toThrow(ErrorValidacion);
  });
});

describe('validarDatosPago', () => {
  const base = { id_cliente: 1, id_membresia: 2, fecha_pago: '2026-03-01', monto: 30 };

  test('usa PAGADO si no se indica el estado', () => {
    expect(validarDatosPago(base)).toEqual({ ...base, estado: 'PAGADO' });
  });

  test('respeta el estado indicado', () => {
    expect(validarDatosPago({ ...base, estado: 'PENDIENTE' }).estado).toBe('PENDIENTE');
  });

  test('un cuerpo vacío o ausente se rechaza', () => {
    expect(() => validarDatosPago({})).toThrow(ErrorValidacion);
    expect(() => validarDatosPago(undefined)).toThrow(ErrorValidacion);
  });

  test.each([['id_cliente'], ['id_membresia'], ['fecha_pago'], ['monto']])('exige %s', (campo) => {
    const datos = { ...base };
    delete datos[campo];
    expect(() => validarDatosPago(datos)).toThrow(ErrorValidacion);
  });
});

describe('validarTransicion (transición de estados)', () => {
  test.each([['PENDIENTE', 'PAGADO'], ['PENDIENTE', 'ANULADO'], ['PAGADO', 'ANULADO']])(
    'permite %s -> %s',
    (actual, nuevo) => {
      expect(() => validarTransicion(actual, nuevo)).not.toThrow();
    }
  );

  test.each([
    ['PAGADO', 'PENDIENTE'],
    ['PAGADO', 'PAGADO'],
    ['PENDIENTE', 'PENDIENTE'],
    ['ANULADO', 'PAGADO'],
    ['ANULADO', 'PENDIENTE'],
    ['ANULADO', 'ANULADO'],
  ])('rechaza %s -> %s', (actual, nuevo) => {
    expect(() => validarTransicion(actual, nuevo)).toThrow(ErrorReglaNegocio);
  });
});
