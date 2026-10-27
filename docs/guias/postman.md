# Probar los endpoints con Postman

Entregable del proyecto: **cada integrante entrega una colección de Postman con las pruebas de sus endpoints.**

## 1. Preparar Postman
1. Levanta la API: `npm run dev` (queda en `http://localhost:3000`).
2. En Postman: **Import** y selecciona estos dos archivos de `docs/postman/`:
   - `gimnasio.postman_environment.json` (define la variable `{{baseUrl}}`)
   - `00-base.postman_collection.json` (prueba `/health` y `/health/db`)
3. Arriba a la derecha elige el entorno **Gimnasio - Local**.
4. Ejecuta la colección `00 - Base`: las dos peticiones deben quedar en verde.

## 2. Tu colección
Cada quien crea **su propio archivo** para no chocar en Git:

| Responsable | Archivo |
|---|---|
| Rubén | `docs/postman/clientes.postman_collection.json` |
| Andres | `docs/postman/membresias.postman_collection.json` |
| Maycol | `docs/postman/pagos.postman_collection.json` |
| Danny | `docs/postman/accesos.postman_collection.json` |

1. En Postman crea una colección con el nombre de tu módulo.
2. Agrega **una petición por endpoint**, usando `{{baseUrl}}/api/...` como URL.
3. Agrega una petición por **cada caso de error** (400, 404, 409, 422) además de los casos correctos.
4. En la pestaña **Tests** de cada petición escribe verificaciones:
   ```js
   pm.test('Responde 201', () => pm.response.to.have.status(201));
   pm.test('Devuelve el id', () => pm.expect(pm.response.json()).to.have.property('id_cliente'));
   ```
5. Para encadenar peticiones (por ejemplo, guardar el id creado), usa variables de colección:
   ```js
   pm.collectionVariables.set('idCliente', pm.response.json().id_cliente);
   ```
   y luego `{{idCliente}}` en la URL de la siguiente petición.
6. Exporta: `...` de la colección → **Export** → Collection v2.1, y guarda el archivo en `docs/postman/` con el nombre de la tabla de arriba.
7. Sube el archivo en tu rama junto con tu código.

## 3. Ejecutar toda la colección
En Postman: colección → **Run** → ejecuta todas las peticiones. Toma una captura del resultado (todas en verde): va en el informe.

## 4. Orden recomendado de las peticiones
1. Crear (caso correcto) → guarda el id.
2. Consultar uno / listar.
3. Modificar.
4. Casos de error: datos inválidos (400), id inexistente (404), duplicado (409), regla de negocio (422).
5. Eliminar (si tu módulo lo permite).

## 5. Datos de prueba entre módulos
Los pagos y accesos necesitan un cliente y una membresía existentes. Para probar en conjunto, primero crea un cliente (`POST /api/clientes`) y una membresía (`POST /api/membresias`) y usa sus ids. Mientras el módulo de otro compañero no esté en `main`, prueba con filas insertadas desde el SQL Editor de Supabase.
