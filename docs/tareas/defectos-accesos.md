# Defectos intencionales: módulo Accesos

Ejercicio de la materia: dos defectos introducidos a propósito en el módulo de accesos, con las pruebas que los detectan.

## Defecto 1: permitir una segunda entrada sin que haya salida

| | |
|---|---|
| **Dónde** | `src/modules/acceso/acceso.servicio.js`, función `registrarEntrada` |
| **Qué pasa** | Un cliente con una entrada abierta puede registrar una segunda entrada sin haber registrado su salida |
| **Regla incumplida** | «Una sola entrada abierta: si el cliente ya tiene un acceso sin salida → 409» (`docs/tareas/danny-accesos.md`, sección 4) |
| **Técnica de prueba** | Transición de estados: intentar registrar dos entradas consecutivas sin salida intermedia |
| **Prueba que lo detecta** | `intento inválido: entrar dos veces consecutivas lanza ErrorConflicto (409)` |
| **Punto a corregir** | Consultar `buscarAbiertoPorCliente` antes de crear la entrada y lanzar `ErrorConflicto` si ya existe un registro abierto |

## Defecto 2: calcular la permanencia en horas en lugar de minutos

| | |
|---|---|
| **Dónde** | `src/modules/acceso/acceso.permanencia.js`, función `calcularPermanenciaMinutos` |
| **Qué pasa** | La permanencia se calcula dividiendo entre `(1000 * 60 * 60)` (horas) en lugar de `(1000 * 60)` (minutos), truncando a 0 o devolviendo horas |
| **Regla incumplida** | «`permanencia_minutos` = diferencia entre salida y entrada, en **minutos** (entero redondeado hacia abajo)» (`docs/tareas/danny-accesos.md`, sección 4) |
| **Técnica de prueba** | Valores límite y casos de borde: permanencias menores a una hora (45 min en cruce de medianoche, 59 min) y redondeo hacia abajo |
| **Pruebas que lo detectan** | `cruce de medianoche: entrar a las 23:30 y salir a las 00:15 del día siguiente son 45 minutos` y `permanencia de exactamente 59 minutos` |
| **Punto a corregir** | Dividir la diferencia en milisegundos entre `(1000 * 60)` en lugar de `(1000 * 60 * 60)` |
