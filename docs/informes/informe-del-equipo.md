# Informe del equipo: qué pasó entre fases y qué prueba cada uno

Documento informal para ponernos al día los cuatro (Maycol, Rubén, Andres y Danny). Si solo tienes 2 minutos, lee la sección 1 y la tuya en la sección 5.

## 1. Resumen en 30 segundos
- Hicimos un **back-end** (sin frontend): una API en Node.js y Express que guarda todo en una base PostgreSQL en Supabase.
- Hay 4 módulos (clientes, membresías, pagos, accesos), uno por persona, más 3 reportes y pruebas de integración.
- **Lo que pide la materia ya está:** cobertura global de Jest del 70 %, pruebas con Jest, ESLint sin errores, reporte de SonarQube y pruebas de endpoints con Postman.
- **A propósito dejamos 2 defectos sin corregir en cada módulo**, y las pruebas que los detectan fallan (17 en total). No hay que arreglarlos.
- Todo está en la rama `main` de https://github.com/xMaycol08/Gimnasio_PruebasSoftware.

## 2. Qué pasó en cada fase

| Fase | Qué se hizo | Quién |
|---|---|---|
| Modelado | Base de datos de 4 tablas (conceptual, lógico y físico), reparto del trabajo y reglas de equipo | Maycol |
| 0: base del proyecto | Express, conexión a Supabase, Jest, ESLint, SonarQube, CI de GitHub, Postman base, `.gitignore` y `.env`, guías por persona | Maycol |
| 1: módulos | Cada quien hizo su módulo en su rama y lo subió con un Pull Request: clientes (PR #7), membresías (PR #9), pagos (PR #5) y accesos (PR #8) | Todos |
| Ajuste de defectos | Se acordó que la entrega final conserva los defectos intencionales sin corregir; Maycol lo dejó así en clientes (PR #11), Danny en accesos (PR #10) y Maycol en pagos (PR #6) | Maycol y Danny |
| 2: integración y reportes | Prueba de integración con los 4 módulos juntos, colección Postman de flujo completo y 3 reportes (por vencer, morosos, asistencia) (PR #12) | Maycol |
| 3: calidad | Lint sin errores, cobertura global ajustada a 70 %, colección de pagos autónoma (PR #13) | Maycol |

## 3. Cómo está `main` hoy

| Qué | Resultado |
|---|---|
| `npm run lint` | Sin errores |
| `npm run test:cov` (la medición oficial) | Statements 70,52 %, Branches 70,08 %, Functions 70,51 %, Lines 70,63 % |
| Pruebas de `test:cov` | 175 ejecutadas: 158 pasan y 17 fallan a propósito |
| `npm run test:completo` | 338 pruebas: 321 pasan y 17 fallan a propósito |
| SonarQube | Security A (0), Reliability C (2 problemas), Maintainability A (4), duplicación 0 %, cobertura 69,7 % |
| Postman | Pagos: 22 peticiones, 2 fallan a propósito. Flujo completo: 20 de 20. Reportes: 25 de 25 |

La cobertura de SonarQube (69,7 %) sale un poco más baja que la de Jest porque la calcula con otra fórmula; la explicación está en `docs/informes/como-funciona-todo.md`, sección 7.

## 4. Los defectos intencionales (los 8 que dejamos)

El ejercicio de la materia pide provocar errores y comprobar que las pruebas los detectan. Cada módulo tiene 2:

| Módulo | Defecto | Prueba que lo detecta |
|---|---|---|
| Clientes (Rubén) | La cédula acepta más de 10 dígitos | `validarCedula rechaza una cédula con más de 10 dígitos` |
| Clientes (Rubén) | El correo se compara distinguiendo mayúsculas | `busca correos sin distinguir mayúsculas y minúsculas` |
| Membresías (Andres) | Acepta precio 0 | `rechaza precio igual a 0 lanzando ErrorValidacion` |
| Membresías (Andres) | No normaliza el nombre ("Anual" y "anual" pasan como distintos) | `normaliza el nombre a minúsculas...` |
| Pagos (Maycol) | El día del vencimiento aparece como vencido | `esVigente: valores límite el día del vencimiento` |
| Pagos (Maycol) | Un pago anulado o pendiente da vigencia | Pruebas de tabla de decisión (estado × fecha) |
| Accesos (Danny) | Permite dos entradas sin salida | `entrar dos veces consecutivas lanza ErrorConflicto` |
| Accesos (Danny) | La permanencia se calcula en horas, no en minutos | Pruebas de `acceso.permanencia` |

Cada módulo explica sus 2 defectos y el punto exacto a corregir en `docs/tareas/defectos-<modulo>.md`. **No los corrijan:** son parte de lo que se entrega.

## 5. Qué prueba cada uno

### Pasos comunes (los 4)
1. Actualizar: `git checkout main` y `git pull origin main`.
2. Instalar: `npm install`.
3. Comprobar que el `.env` existe y que `npm run db:check` dice "Conexión correcta" con las 4 tablas.
4. `npm run lint`: debe salir sin errores.
5. `npm run test:cov`: debe mostrar 70,52 / 70,08 / 70,51 / 70,63 y `17 failed, 158 passed`. Si falla algo más, avisar.
6. Levantar la API: `npm run dev`.
7. Postman de **escritorio** (no el del navegador, que no llega a localhost): importar de `docs/postman/` el entorno `gimnasio.postman_environment.json` y la colección de su módulo, elegir el entorno **Gimnasio - Local** y ejecutar con **Run collection**.
8. Tomar capturas (ver sección 6).

### Rubén: clientes
- Colección: `clientes.postman_collection.json`. Crea su propio cliente con datos únicos y lo borra al final.
- Resultado esperado: todas las peticiones en verde. Los 2 defectos de clientes se ven en Jest, no en Postman.
- Capturas: la colección ejecutada y la tabla `cliente` en Supabase.

### Andres: membresías
- Colección: `membresias.postman_collection.json`. Usa un sufijo único en los nombres.
- Resultado esperado: todo en verde, salvo lo que dependa de sus defectos (precio 0 y nombres en distinta capitalización).
- Capturas: la colección ejecutada y la tabla `membresia`.

### Danny: accesos
- Colección: `accesos.postman_collection.json`.
- **Ojo:** usa `idCliente = 1` y fechas fijas de marzo de 2026. Para que pase, ese cliente debe tener un pago que cubra el 01/03/2026. Si no lo tienes, avisa a Maycol y se prepara.
- Resultado esperado: fallan las peticiones ligadas a sus defectos (segunda entrada sin salida y permanencia).
- Capturas: la colección ejecutada y la tabla `acceso`.

### Maycol: pagos, flujo, reportes y Sonar
- Colecciones: `pagos` (22 peticiones; fallan la 13 y la 20 a propósito), `05-flujo-completo` (20 de 20) y `reportes` (25 de 25).
- SonarQube: `npm run test:cov` y luego `sonar-scanner` (ver `docs/guias/sonarqube.md`).
- Capturas: Overview e Issues de Sonar, colecciones ejecutadas, tablas de Supabase con datos, y la cobertura en terminal.

## 6. Qué falta para entregar
- [ ] Capturas de Postman de cada colección ejecutada (una por persona, y las de Maycol).
- [ ] Captura de la tabla de cada módulo en Supabase con datos.
- [ ] Captura de SonarQube (Overview e Issues) y de la cobertura de Jest.
- [ ] Revisar que nadie haya corregido los defectos intencionales.
- [ ] Decidir si se limpian los datos de prueba de Supabase antes de entregar (opcional).

## 7. Reglas que seguimos
- Nadie sube directo a `main`: cada cambio va en una rama y se abre un Pull Request.
- Maycol revisa y fusiona los PRs con **Squash and merge**.
- Cada uno edita solo su carpeta: `src/modules/<su-modulo>/` y `tests/<su-modulo>/`.
- Antes de un PR: `npm run lint` y `npm run test:cov` (si se agrega código sin pruebas, la cobertura baja de 70 % y falla).
- El `.env` nunca se sube a GitHub.
