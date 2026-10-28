# Defectos intencionales del módulo Clientes

## Defecto 1: Longitud incorrecta de cédula

- **Qué ocurre:** el sistema podía aceptar cédulas con una longitud distinta de 10 dígitos.
- **Dónde:** `src/modules/cliente/cliente.validaciones.js`.
- **Prueba que lo detecta:** prueba de valores límite para cédulas de 9, 10 y 11 dígitos en `tests/cliente/cliente.validaciones.test.js`.
- **Commit de prueba:** `29c8860` — `test: detecta cedulas con longitud incorrecta`.
- **Commit de corrección:** `e05b4dd` — `fix: valida longitud exacta de cedula`.
- **Resultado:** la prueba detectó el defecto antes de la corrección y pasó después de corregirlo.

## Defecto 2: Correos duplicados con distinta capitalización

- **Qué ocurre:** la consulta podía comparar los correos distinguiendo entre mayúsculas y minúsculas.
- **Dónde:** `src/modules/cliente/cliente.repositorio.js`.
- **Prueba que lo detecta:** prueba en `tests/cliente/cliente.repositorio.test.js` que verifica la comparación de correos sin distinguir mayúsculas y minúsculas.
- **Commit de prueba:** `da51fb1` — `test: detecta correos duplicados por capitalizacion`.
- **Commit de corrección:** `fe52202` — `fix: compara correos sin distinguir mayusculas`.
- **Resultado:** la prueba detectó el cambio incorrecto en la consulta y pasó después de restaurar la comparación con `LOWER()`.

## Verificación final

- Pruebas automatizadas: 57 aprobadas en 8 suites.
- Lint: aprobado.
- Cobertura global de instrucciones: 89,79 %.
- Cobertura global de líneas: 89,52 %.
- Pruebas de API realizadas manualmente en Postman: listar, crear, consultar, actualizar y eliminar clientes; también se verificaron respuestas 400, 404 y 409.

