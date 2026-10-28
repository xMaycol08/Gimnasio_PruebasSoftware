describe('módulos de reportes', () => {
  test.each([
    ['reporte-vencimientos', '/api/reportes/vencimientos'],
    ['reporte-asistencia', '/api/reportes/asistencia'],
  ])('%s exporta basePath y router', (modulo, ruta) => {
    const exportado = require(`../../src/modules/${modulo}`);
    expect(exportado.basePath).toBe(ruta);
    expect(typeof exportado.router).toBe('function');
  });
});
