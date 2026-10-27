const {
  ErrorApp,
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorConflicto,
  ErrorReglaNegocio,
} = require('../../src/shared/errores');

describe('errores compartidos', () => {
  test.each([
    [ErrorValidacion, 400],
    [ErrorNoEncontrado, 404],
    [ErrorConflicto, 409],
    [ErrorReglaNegocio, 422],
  ])('%p usa el código HTTP %i', (Clase, estado) => {
    const error = new Clase('mensaje');
    expect(error).toBeInstanceOf(ErrorApp);
    expect(error.estado).toBe(estado);
    expect(error.message).toBe('mensaje');
  });

  test('ErrorApp usa 500 por defecto', () => {
    expect(new ErrorApp('falla').estado).toBe(500);
  });
});
