# Tarea de Rubén: módulo Clientes

| | |
|---|---|
| **Tabla** | `CLIENTE` |
| **Rama** | `feature/clientes` |
| **Carpetas tuyas** | `src/modules/cliente/`, `tests/cliente/`, `docs/postman/clientes.postman_collection.json` |
| **Tu PR lo revisa** | Andres |
| **Tú revisas el PR de** | Maycol (`feature/pagos`) |
| **Antes de empezar** | Lee `docs/guias/00-inicio-rapido.md` y `docs/guias/plantilla-modulo.md` |

## 1. Objetivo
Gestionar los clientes del gimnasio (CRUD completo) con validaciones sólidas, y ofrecer a los demás módulos dos funciones: `obtenerPorId` y `clienteExiste`.

## 2. Tabla (de `database/schema.sql`)
`cliente(id_cliente, nombre, cedula, telefono, email)`: `cedula` y `email` son únicos.

## 3. Endpoints (`basePath: /api/clientes`)

| Método | Ruta | Cuerpo | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/clientes` | `{ nombre, cedula, telefono?, email }` | 201 + cliente | 400 datos inválidos, 409 cédula o email repetidos |
| GET | `/api/clientes` | | 200 + lista | |
| GET | `/api/clientes/:id` | | 200 + cliente | 404 |
| PUT | `/api/clientes/:id` | `{ nombre, cedula, telefono?, email }` | 200 + cliente | 400, 404, 409 |
| DELETE | `/api/clientes/:id` | | 204 | 404, 409 si tiene pagos o accesos |

## 4. Reglas de negocio y validaciones

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, texto, 1 a 100 caracteres (sin contar espacios de los extremos) |
| `cedula` | 10 dígitos numéricos y cédula ecuatoriana válida (algoritmo de abajo) |
| `telefono` | Opcional; si viene, solo dígitos, de 7 a 15 |
| `email` | Obligatorio, formato válido, máximo 120 caracteres; se guarda en minúsculas |
| Unicidad | No pueden existir dos clientes con la misma cédula ni el mismo email (sin distinguir mayúsculas) → 409 |
| Eliminar | Si el cliente tiene pagos o accesos la base lo impide (`ON DELETE RESTRICT`, error de Postgres `23503`); respóndelo como 409 con un mensaje claro |

**Algoritmo de la cédula (módulo 10):**
1. Los 2 primeros dígitos son la provincia: de `01` a `24`, o `30`.
2. El tercer dígito debe ser menor que 6.
3. Multiplica los 9 primeros dígitos por `2,1,2,1,2,1,2,1,2`; si un producto pasa de 9, réstale 9; suma todo.
4. El dígito verificador es `(10 - suma % 10) % 10` y debe ser igual al décimo dígito.

Cédulas válidas para tus pruebas: `1710034065`, `0926687856`, `1104680135`. Inválida (verificador mal): `1712345678`.

## 5. Contrato público (lo que usan los demás; **no cambia su firma**)

| Función | Devuelve |
|---|---|
| `obtenerPorId(idCliente)` | `{ id_cliente, nombre, cedula, telefono, email }` o `null` |
| `clienteExiste(idCliente)` | `boolean` |

Exportadas desde `src/modules/cliente/index.js` junto a `basePath` y `router`.

## 6. Pruebas Jest (mínimo; amplía las que quieras)

| Técnica | Qué probar |
|---|---|
| Partición de equivalencia | cédula válida / inválida por provincia / inválida por tercer dígito / inválida por verificador / con letras; email válido / sin `@` / sin dominio |
| Valores límite | teléfono de 6, 7, 15 y 16 dígitos; nombre de 0, 1, 100 y 101 caracteres; cédula de 9, 10 y 11 dígitos |
| Casos de servicio (repositorio con stub) | crear OK, cédula duplicada → `ErrorConflicto`, email duplicado con otra capitalización, obtener inexistente → `ErrorNoEncontrado`, eliminar con pagos → `ErrorConflicto` |
| Router (supertest) | códigos 201, 200, 204, 400, 404, 409 |

Archivos sugeridos: `cliente.validaciones.test.js`, `cliente.servicio.test.js`, `cliente.router.test.js`.

## 7. Defectos intencionales (parte del ejercicio de la materia)
Introduce **dos defectos** y sigue el ciclo: documentarlo → escribir la prueba que lo detecta (falla) → corregir (pasa). Un commit `test:` y otro `fix:` por defecto, para que el historial sirva de evidencia. Ideas para ti:
1. Aceptar cédulas de 9 u 11 dígitos (cambiar `=== 10` por `>= 9`).
2. No detectar emails duplicados cuando cambia la capitalización.

Anótalos en `docs/tareas/defectos-clientes.md` (qué, dónde, prueba que lo detecta, commit del arreglo).

## 8. Postman
Colección `clientes.postman_collection.json` con una petición por endpoint y una por cada error (400, 404, 409). Guía: `docs/guias/postman.md`.

## 9. Definición de terminado
- [ ] 5 endpoints funcionando contra Supabase
- [ ] Validaciones y contrato público implementados
- [ ] Pruebas Jest de validaciones, servicio y router
- [ ] 2 defectos intencionales documentados y corregidos
- [ ] `npm run lint` y `npm run test:cov` sin errores
- [ ] Colección Postman exportada y subida
- [ ] Sin problemas altos de SonarQube en tus archivos
- [ ] PR revisado y aprobado por Andres; Maycol lo fusiona con **Squash and merge**
