# Defectos intencionales: módulo Clientes

Ejercicio de la materia: dos defectos introducidos a propósito, con las pruebas que los detectan.

## Defecto 1: cédulas con longitud incorrecta

| | |
|---|---|
| **Dónde** | `src/modules/cliente/cliente.validaciones.js`, función `validarCedula` |
| **Qué pasa** | Se aceptan cédulas con una longitud distinta de 10 dígitos (por ejemplo, de 11) |
| **Regla incumplida** | «La cédula debe tener 10 dígitos» (`docs/tareas/ruben-clientes.md`, sección 4) |
| **Técnica de prueba** | Valores límite: cédulas de 9, 10 y 11 dígitos |
| **Prueba que lo detecta** | `validarCedula rechaza una cédula con más de 10 dígitos` (`tests/cliente/cliente.validaciones.test.js`) |
| **Punto a corregir** | La expresión regular debe exigir exactamente 10 dígitos: `/^\d{10}$/` (hoy `/^\d{9,11}$/`) |

## Defecto 2: correos duplicados con distinta capitalización

| | |
|---|---|
| **Dónde** | `src/modules/cliente/cliente.repositorio.js`, función `buscarPorEmail` |
| **Qué pasa** | La consulta compara el correo distinguiendo mayúsculas y minúsculas |
| **Regla incumplida** | «No pueden existir dos clientes con el mismo email (sin distinguir mayúsculas)» |
| **Técnica de prueba** | Partición de equivalencia de correos: igual, igual con otra capitalización, distinto |
| **Prueba que lo detecta** | `busca correos sin distinguir mayúsculas y minúsculas` (`tests/cliente/cliente.repositorio.test.js`) |
| **Punto a corregir** | La condición debe ser `WHERE LOWER(email) = LOWER($1)` (hoy `WHERE email = $1`) |
