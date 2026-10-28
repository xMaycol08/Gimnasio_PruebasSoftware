const { validarMembresia } = require('../../src/modules/membresia/membresia.validaciones');
const { ErrorValidacion } = require('../../src/shared/errores');

describe('Validaciones de membresia', () => {
  test('acepta datos correctos y recorta espacios del nombre', () => {
    const datos = { nombre: '  Mensual  ', precio: 30, duracion_dias: 30 };
    const resultado = validarMembresia(datos);
    expect(resultado.nombre).toBe('Mensual');
    expect(resultado.precio).toBe(30);
  });

  test('rechaza precio igual a 0 lanzando ErrorValidacion', () => {
    expect(() => validarMembresia({ nombre: 'Gratis', precio: 0, duracion_dias: 30 }))
      .toThrow(ErrorValidacion);
  });

  test('rechaza precio negativo', () => {
    expect(() => validarMembresia({ nombre: 'Invalida', precio: -5, duracion_dias: 30 }))
      .toThrow(ErrorValidacion);
  });

  test('rechaza duración decimal', () => {
    expect(() => validarMembresia({ nombre: 'Invalida', precio: 30, duracion_dias: 1.5 }))
      .toThrow(ErrorValidacion);
  });

  test('rechaza nombre vacío', () => {
    expect(() => validarMembresia({ nombre: '   ', precio: 30, duracion_dias: 30 }))
      .toThrow(ErrorValidacion);
  });

  test('normaliza el nombre a minúsculas para evitar duplicados por capitalización', () => {
    const resultado = validarMembresia({ nombre: ' ANUAL ', precio: 30, duracion_dias: 30 });
    expect(resultado.nombre).toBe('anual');
  });
});