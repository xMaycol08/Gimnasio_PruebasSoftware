# Registro de Defectos Intencionales - Módulo Accesos

**Responsable:** Danny  
**Módulo:** `src/modules/acceso/`  
**Rama:** `feature/accesos`

Este documento registra los dos defectos intencionales introducidos en el módulo de Accesos siguiendo el ciclo:
1. Documentación del defecto y comportamiento incorrecto.
2. Escritura de la prueba automatizada que lo detecta (falla con el defecto).
3. Corrección del defecto y verificación de que la prueba pasa.

---

## Defecto 1: Permitir una segunda entrada sin que haya salida

### 1. Descripción y causa
- **Ubicación:** `src/modules/acceso/acceso.servicio.js`, en el método `registrarEntrada(idCliente, fechaHora)`.
- **Causa:** Se omitió la comprobación previa en el repositorio (`buscarAbiertoPorCliente`) para verificar si el cliente ya poseía un registro de acceso con `fecha_hora_salida IS NULL`.
- **Comportamiento incorrecto:** Un cliente con una entrada abierta podía registrar una segunda entrada inmediatamente, creando múltiples registros abiertos concurrentes y violando la regla de negocio: *"Una sola entrada abierta: si el cliente ya tiene un acceso sin salida → 409"*.

### 2. Prueba que lo detecta
- **Archivo:** `tests/acceso/acceso.servicio.test.js`
- **Nombre de la prueba:** `intento inválido: entrar dos veces consecutivas lanza ErrorConflicto (409)`
- **Resultado al ejecutar con el defecto (fallo):**
  ```text
  ● acceso.servicio (reglas de negocio y transiciones) › Transición de estados › intento inválido: entrar dos veces consecutivas lanza ErrorConflicto (409)

    expect(received).rejects.toMatchObject()

    Received promise resolved instead of rejected
    Resolved to value: { id_acceso: 102, id_cliente: 1, ... }
  ```

### 3. Corrección aplicada
En `src/modules/acceso/acceso.servicio.js`:
```javascript
const accesoAbierto = await repositorio.buscarAbiertoPorCliente(idCliente);
if (accesoAbierto) {
  throw new ErrorConflicto('El cliente ya tiene una entrada abierta');
}
```

### 4. Verificación
Al ejecutar `npm test tests/acceso/acceso.servicio.test.js`, la prueba pasa exitosamente confirmando que el intento duplicado es rechazado con `ErrorConflicto` (HTTP 409).

---

## Defecto 2: Calcular la permanencia en horas en lugar de minutos

### 1. Descripción y causa
- **Ubicación:** `src/modules/acceso/acceso.permanencia.js`, en la función pura `calcularPermanenciaMinutos(fechaEntrada, fechaSalida)`.
- **Causa:** En lugar de dividir los milisegundos transcurridos entre `(1000 * 60)` (milisegundos por minuto), se dividió erróneamente entre `(1000 * 60 * 60)` (milisegundos por hora).
- **Comportamiento incorrecto:** 
  - Para permanencias de 45 minutos (ej. cruce de medianoche de 23:30 a 00:15) o 59 minutos, `Math.floor` truncaba el valor a `0` horas.
  - Para 75 minutos devolvía `1` en lugar de `75`.
  - La API violaba la regla de negocio: *"permanencia_minutos = diferencia entre salida y entrada, en minutos (entero redondeado hacia abajo)"*.

### 2. Pruebas que lo detectan
- **Archivo:** `tests/acceso/acceso.permanencia.test.js`
- **Nombres de las pruebas:**
  - `cruce de medianoche: entrar a las 23:30 y salir a las 00:15 del día siguiente son 45 minutos`
  - `permanencia de exactamente 59 minutos`
- **Resultado al ejecutar con el defecto (fallo):**
  ```text
  ● acceso.permanencia (cálculo de permanencia en minutos) › Cruce de medianoche y redondeo hacia abajo › cruce de medianoche: entrar a las 23:30 y salir a las 00:15 del día siguiente son 45 minutos

    expect(received).toBe(expected) // Object.is equality

    Expected: 45
    Received: 0
  ```

### 3. Corrección aplicada
En `src/modules/acceso/acceso.permanencia.js`:
```javascript
const diffMs = salida.getTime() - entrada.getTime();
if (diffMs < 0) {
  throw new RangeError('La fecha de salida no puede ser anterior a la de entrada');
}

return Math.floor(diffMs / (1000 * 60));
```

### 4. Verificación
Al ejecutar `npm test tests/acceso/acceso.permanencia.test.js`, todas las pruebas de permanencia (0, 45, 59, 60, 61 minutos) pasan en verde.
