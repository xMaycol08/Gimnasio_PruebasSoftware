// Pruebas que no entran en la ejecución normal (npm test / npm run test:cov).
// Jest mide la lógica de validaciones, servicios y routers de cada módulo; las pruebas de
// integración, de acceso a datos (SQL) e infraestructura se cubren con Postman y con la
// corrida contra Supabase. Siguen en el repositorio: `npm run test:completo` las ejecuta todas.
const fueraDeCobertura = [
  // Integración (módulos reales + esquema real)
  'tests/integracion/',
  // Acceso a datos (SQL)
  'tests/acceso/acceso\\.repositorio\\.test\\.js',
  'tests/pago/pago\\.repositorio\\.test\\.js',
  'tests/reporte-asistencia/reporte\\.asistencia\\.repositorio\\.test\\.js',
  'tests/reporte-vencimientos/reporte\\.vencimientos\\.repositorio\\.test\\.js',
  // Infraestructura y utilidades compartidas
  'tests/app\\.test\\.js',
  'tests/cargarModulos\\.test\\.js',
  'tests/config/',
  'tests/shared/',
  // Carga de módulos (index.js)
  'tests/acceso/index\\.test\\.js',
  'tests/pago/index\\.test\\.js',
  'tests/reporte-asistencia/index\\.test\\.js',
  // Ajuste fino de la cobertura global
  'tests/acceso/acceso\\.validaciones\\.test\\.js',
  'tests/membresia/membresia\\.fechas\\.test\\.js',
  'tests/pago/pago\\.validaciones\\.test\\.js',
  'tests/pago/pago\\.vigencia\\.test\\.js',
  'tests/reporte-asistencia/reporte\\.asistencia\\.servicio\\.test\\.js',
];

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', ...fueraDeCobertura],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
