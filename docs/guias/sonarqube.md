# Análisis con SonarQube

Entregable del proyecto: **reporte de SonarQube** (bugs, vulnerabilidades, code smells, cobertura y duplicación). Se hace igual que en el Laboratorio 1: SonarQube en Docker Desktop, proyecto creado en la web, token y análisis con SonarScanner.

> Lo ejecuta **Maycol** (ya tiene SonarQube instalado). Los demás solo necesitan corregir los problemas que SonarQube marque en sus archivos.

## 1. Levantar SonarQube
Con Docker Desktop (como en el laboratorio: contenedores `sonarqube` y `sonarqube_db`). Si no lo tienes, este `docker-compose.yml` crea lo mismo (guárdalo **fuera** del repositorio):

```yaml
services:
  sonarqube:
    image: sonarqube:community
    depends_on:
      - sonarqube_db
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://sonarqube_db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
    ports:
      - "9000:9000"
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
  sonarqube_db:
    image: postgres:15
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
      POSTGRES_DB: sonar
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgres_data:
```
`docker compose up -d` y abre `http://localhost:9000` (primera vez: `admin` / `admin`).

## 2. Crear el proyecto (igual que en el laboratorio)
1. **Create Project** → *Create a local project*.
2. **Project display name:** `Gimnasio_PruebasSoftware`.
3. **Project key:** `Gimnasio_PruebasSoftware` (debe coincidir con `sonar.projectKey` de `sonar-project.properties`; si usas otra clave, cámbiala allí o pásala con `-D"sonar.projectKey=..."`).
4. **Main branch name:** `main`. Opciones predeterminadas y *Locally*.
5. **Generate a token** y elige *Other* → *Windows*. Copia el token (no lo guardes en ningún archivo del repo).

## 3. Generar la cobertura
Jest crea `coverage/lcov.info`, que SonarQube lee para mostrar la cobertura:
```
npm run test:cov
```

## 4. Ejecutar el análisis
En la carpeta del proyecto, con el SonarScanner CLI del laboratorio (el proyecto ya trae `sonar-project.properties` con las carpetas, exclusiones y la ruta de cobertura, así que solo hace falta el servidor y el token):

```
sonar-scanner.bat -D"sonar.host.url=http://localhost:9000" -D"sonar.token=TU_TOKEN"
```
(Linux/Mac: `sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=TU_TOKEN`)

No pases `-D"sonar.sources=."`: eso mezclaría las pruebas, la configuración y `node_modules` con el código real. El archivo `sonar-project.properties` ya define `sonar.sources=src` y `sonar.tests=tests`.

## 5. Revisar los resultados
En `http://localhost:9000` → proyecto → *Overview*:
- **Security / Reliability / Maintainability:** apunta a calificación **A**.
- **Coverage:** debe reflejar el ≥ 70 % de Jest.
- **Issues:** corrige primero los de severidad alta.

## 6. Qué entregar
1. Captura del **análisis inicial** (antes de corregir).
2. Corrige los problemas y vuelve a ejecutar los pasos 3 y 4.
3. Captura del **análisis final** con calificación A y la cobertura.
4. Breve explicación de los problemas corregidos (como en el Laboratorio 1).

El análisis global se hace cuando los 4 módulos estén en `main`.
