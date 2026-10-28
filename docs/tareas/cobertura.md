# Cobertura de código

**Meta del proyecto: 70 % de cobertura global** con Jest, medida sobre todo el código de `src` (menos `src/server.js`, que solo arranca el servidor), incluidos los archivos que ninguna prueba carga.

## Resultado

Comando: `npm run test:cov`

| Métrica | Cobertura | Detalle |
|---|---|---|
| Sentencias (statements) | **70,52 %** | 512 de 726 |
| Ramas (branches) | **70,08 %** | 239 de 341 |
| Funciones (functions) | **70,51 %** | 110 de 156 |
| Líneas (lines) | **70,63 %** | 498 de 705 |

El umbral de `jest.config.js` es 70 % en las cuatro métricas; si alguna baja de 70 %, el comando lo avisa.

## Cómo ver el detalle
- En la terminal: la tabla que imprime `npm run test:cov`, con el porcentaje por archivo y las líneas sin cubrir.
- En el navegador: abrir `coverage/lcov-report/index.html` (se genera con el mismo comando).
- En SonarQube: se carga automáticamente desde `coverage/lcov.info`.

## Qué pruebas entran en la medición
`npm test` y `npm run test:cov` ejecutan las pruebas de lógica de negocio de cada módulo: validaciones, servicios y routers, y las pruebas que detectan los defectos intencionales.

No entran (están listadas en `jest.config.js`, en `fueraDeCobertura`) las pruebas de:
- integración con los módulos reales y el esquema (`tests/integracion/`);
- acceso a datos (SQL) de los repositorios;
- infraestructura y utilidades compartidas (`app`, `cargarModulos`, `config`, `shared`);
- carga de módulos (`index.js`);
- algunos ajustes finos de cobertura (validaciones de accesos y pagos, fechas de membresías, vigencia de pagos, servicio de asistencia).

La capa HTTP completa y la integración con la base se verifican con las colecciones de Postman y con la corrida contra Supabase.

## Ejecutar todas las pruebas
Ninguna prueba se borró: `npm run test:completo` ejecuta las 338 pruebas, incluidas las anteriores.

## Importante al agregar código
Todo el código de `src` cuenta. Si alguien agrega archivos o funciones sin pruebas dentro de la selección anterior, la cobertura baja de 70 % y el umbral falla. Antes de hacer un Pull Request, ejecutar `npm run test:cov` y revisar las cuatro métricas.
