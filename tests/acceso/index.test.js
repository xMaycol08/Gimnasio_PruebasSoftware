const moduloAcceso = require('../../src/modules/acceso');

describe('módulo acceso index.js', () => {
  test('exporta basePath y router requeridos por cargarModulos', () => {
    expect(moduloAcceso.basePath).toBe('/api/accesos');
    expect(typeof moduloAcceso.router).toBe('function');
  });

  test('exporta funciones del contrato público', () => {
    expect(typeof moduloAcceso.registrarEntrada).toBe('function');
    expect(typeof moduloAcceso.registrarSalida).toBe('function');
  });

  test('las funciones del contrato público delegan al servicio', async () => {
    // Si se llama sin argumentos, debe lanzar error de validación (ErrorValidacion)
    await expect(moduloAcceso.registrarEntrada()).rejects.toThrow();
    await expect(moduloAcceso.registrarSalida()).rejects.toThrow();
  });
});
