# Análisis con SonarQube

Entregable del proyecto: **reporte de SonarQube** (bugs, vulnerabilidades, code smells, cobertura y duplicación).

## 1. Levantar SonarQube (una vez)
```
docker pull sonarqube
docker run --name sonarqube -p 9000:9000 sonarqube:community
```
Abre `http://localhost:9000` (usuario y contraseña iniciales: `admin` / `admin`; te pedirá cambiarla). Si el contenedor ya existe: `docker start sonarqube`.

## 2. Crear el proyecto
1. **Create a local project**: nombre y clave `Gimnasio_PruebasSoftware`.
2. Elige **Locally** y **Generate a token**. Copia el token (no lo guardes en ningún archivo del repo).

## 3. Generar la cobertura y analizar
SonarQube lee la cobertura del archivo `coverage/lcov.info`, que crea Jest:

```
npm run test:cov
```

Luego ejecuta el scanner (necesita Docker; reemplaza `TU_TOKEN`). En Windows (CMD):
```
docker run --rm --network host -e SONAR_HOST_URL=http://localhost:9000 -e SONAR_TOKEN=TU_TOKEN -v "%cd%:/usr/src" sonarsource/sonar-scanner-cli
```
En Linux o Mac, cambia `%cd%` por `$(pwd)`. La configuración está en `sonar-project.properties`.

> Si `--network host` no funciona en Docker Desktop, cambia `SONAR_HOST_URL` por `http://host.docker.internal:9000`.

## 4. Revisar los resultados
En `http://localhost:9000` abre el proyecto y revisa:
- **Security / Reliability / Maintainability**: apunta a calificación **A**.
- **Coverage**: debe reflejar el ≥ 70 % de Jest.
- **Issues**: corrige los de severidad alta primero (Blocker, High).

## 5. Qué entregar
1. Captura del **análisis inicial** (antes de corregir).
2. Corrige los problemas, vuelve a analizar.
3. Captura del **análisis final** con calificación A y cobertura.
4. Breve explicación de cada problema corregido (como en el Laboratorio 1).

Cada responsable corrige los problemas que SonarQube marque **en sus archivos**. El análisis global lo ejecuta Maycol cuando los 4 módulos estén en `main`.
