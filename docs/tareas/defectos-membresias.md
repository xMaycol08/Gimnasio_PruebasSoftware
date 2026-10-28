# Registro de Defectos Intencionales - Módulo Membresías

**Responsable:** Andres  
**Módulo:** `src/modules/membresia/`  
**Rama:** `feature/membresias`

Este documento registra los dos defectos intencionales introducidos en el módulo de Membresías siguiendo el ciclo:
1. Documentación del defecto y comportamiento incorrecto.
2. Escritura de la prueba automatizada que lo detecta (falla con el defecto).
3. Corrección del defecto y verificación de que la prueba pasa.

---

## Defecto 1: Aceptar precio igual a cero (0)

### 1. Descripción y causa
- **Ubicación:** `src/modules/membresia/membresia.validaciones.js`, en la función pura `validarMembresia(datos)`.
- **Causa:** En la condición de validación del precio, se utilizó el operador menor que (`< 0`) en lugar de menor o igual que (`<= 0`).
- **Comportamiento incorrecto:** El sistema permitía registrar membresías gratuitas (precio `0`), lo cual viola la regla de negocio especificada en los requisitos: *"El precio debe ser un número mayor que 0"*.

### 2. Prueba que lo detecta
- **Archivo:** `tests/membresia/membresia.validaciones.test.js`
- **Nombre de la prueba:** `rechaza precio igual a 0 lanzando ErrorValidacion`
- **Resultado al ejecutar con el defecto (fallo):**
  ```text
  ● validaciones de membresia › rechaza precio igual a 0 lanzando ErrorValidacion

    expect(received).toThrow()

    Received function did not throw