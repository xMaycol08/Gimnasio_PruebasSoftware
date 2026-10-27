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
1. Copia `.env.example` y renómbralo `.env`.
2. Reemplaza `DATABASE_URL` por la cadena real que te pasa Maycol **por un medio privado** (WhatsApp, Teams…).
3. **Nunca** subas el `.env` a Git: ya está en `.gitignore`. Comprueba con `git status` que no aparezca.

Para comprobar que todo conecta:
```
npm run db:check
```
Debe decir `Conexión correcta` y listar las 4 tablas (`cliente, membresia, pago, acceso`).

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
Luego abre un Pull Request hacia `main` en GitHub. Lo revisa el compañero indicado en la tarea y se acepta con **Squash and merge**.

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
