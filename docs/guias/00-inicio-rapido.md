# Guía de inicio rápido

Pasos para dejar el proyecto funcionando en tu computadora. Se hacen **una sola vez**.

## 1. Requisitos
- Git y Node.js 20 o superior (`node -v` para comprobarlo).
- Postman (para probar los endpoints).
- Docker Desktop (solo para SonarQube; ver `docs/guias/sonarqube.md`).

## 2. Clonar e instalar
```
git clone https://github.com/xMaycol08/Gimnasio_PruebasSoftware.git
cd Gimnasio_PruebasSoftware
git config user.name "Tu Nombre"
git config user.email "tu-correo@ejemplo.com"
npm install
```

## 3. Archivo `.env` (conexión a Supabase)

El `.env` guarda datos secretos y **no se sube a Git** (está en `.gitignore`). Se arma así:

**Quien administra Supabase (Maycol), para obtener la cadena de conexión:**
1. Abre el proyecto en Supabase y pulsa **Connect** (arriba).
2. En la ventana, elige la pestaña **Direct Connection** (no "Framework": esa es para Next.js y no la usamos).
3. Elige **Session pooler** (puerto 5432). Se usa el pooler porque la conexión directa solo funciona con IPv6 y la mayoría de redes caseras y universitarias son IPv4.
4. Copia la cadena, que se ve así: `postgresql://postgres.<REF>:[YOUR-PASSWORD]@<host>.pooler.supabase.com:5432/postgres`
5. Reemplaza `[YOUR-PASSWORD]` (incluidos los corchetes) por la contraseña de la base de datos.
   - Si no la recuerdas: *Project Settings → Database → Reset database password*.
   - Si la contraseña tiene símbolos, hay que escribirlos codificados en la URL: `@` → `%40`, `#` → `%23`, `/` → `%2F`, `:` → `%3A`, `?` → `%3F`, `%` → `%25`. Lo más fácil es usar una contraseña solo con letras y números.

**Todos (cada quien en su computadora):**
1. Copia `.env.example` y renómbralo `.env` (en Windows: `copy .env.example .env`).
2. Pega la cadena real en `DATABASE_URL` (Maycol la comparte por un medio privado, nunca por GitHub).
3. Deja el archivo así, sin comillas ni espacios:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres.abcdefghijklmnop:MiClave123@aws-1-us-east-1.pooler.supabase.com:5432/postgres
   ```
4. Comprueba con `git status` que `.env` **no** aparece en la lista.
5. Verifica la conexión:
   ```
   npm run db:check
   ```
   Debe decir `Conexión correcta` y listar `cliente, membresia, pago, acceso`.

| Mensaje de `db:check` | Causa probable |
|---|---|
| `Falta la variable de entorno DATABASE_URL` | El archivo se llama mal (debe ser exactamente `.env`) o está en otra carpeta |
| `password authentication failed` | Contraseña incorrecta o con símbolos sin codificar |
| `getaddrinfo ENOTFOUND` / `ETIMEDOUT` | Host mal copiado, o se usó la conexión directa en lugar del Session pooler |
| `Faltan tablas: ...` | Falta ejecutar `database/schema.sql` en Supabase (*SQL Editor*) |

## 4. Comandos del proyecto

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la API en `http://localhost:3000` y se reinicia al guardar |
| `npm start` | Levanta la API sin reinicio automático |
| `npm test` | Ejecuta las pruebas de Jest |
| `npm run test:cov` | Pruebas + reporte de cobertura (mínimo **70 %**; si baja, el comando falla) |
| `npm run lint` | Revisa el código con ESLint |
| `npm run lint:fix` | Corrige automáticamente lo que ESLint pueda |
| `npm run db:check` | Verifica la conexión a Supabase y las tablas |

Antes de abrir un Pull Request deben pasar **`npm run lint`** y **`npm run test:cov`** sin errores.

## 5. Trabajar con ramas

Las ramas son **por funcionalidad** (no por persona). Ya están creadas:

| Rama | Responsable | Tarea |
|---|---|---|
| `feature/clientes` | Rubén | [`docs/tareas/ruben-clientes.md`](../tareas/ruben-clientes.md) |
| `feature/membresias` | Andres | [`docs/tareas/andres-membresias.md`](../tareas/andres-membresias.md) |
| `feature/pagos` | Maycol | [`docs/tareas/maycol-pagos.md`](../tareas/maycol-pagos.md) |
| `feature/accesos` | Danny | [`docs/tareas/danny-accesos.md`](../tareas/danny-accesos.md) |

```
git fetch origin
git checkout feature/clientes        # cambia por tu rama
git pull origin feature/clientes
# ...trabajas, y cuando tengas algo:
git add .
git commit -m "feat: describe lo que hiciste"
git push origin feature/clientes
```
Luego abre un Pull Request hacia `main` en GitHub. Lo revisa el compañero indicado en la tarea (comenta o aprueba) y **Maycol lo fusiona** con **Squash and merge**. No hagas el merge tú mismo.

Para traer a tu rama lo que otros ya fusionaron en `main`:
```
git fetch origin
git merge origin/main
```

## 6. Reglas de oro
- Solo editas **tu carpeta**: `src/modules/<tu-modulo>/` y `tests/<tu-modulo>/`.
- No toques `package.json`, `eslint.config.js`, `jest.config.js`, `.github/` ni `sonar-project.properties`. Si necesitas una dependencia, pídesela a Maycol.
- No cambies los contratos de `docs/planificacion/asignacion-y-arquitectura.md` sin avisar al grupo.
- Un commit por cambio lógico, con prefijo: `feat:`, `test:`, `fix:`, `docs:`, `refactor:`.
