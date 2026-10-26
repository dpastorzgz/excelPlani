# ADR-0006 — Separación obligatoria de componentes y activos por fichero

- **Status**: Accepted
- **Date**: 2026-10-25
- **Deciders**: User, Agent
- **Context**: Cuadro de mando HTML para planificación de proyectos

## 1. Problem

Una solución local puede acabar concentrando estructura, estilos, configuración, reglas y visualización en un único HTML o JavaScript. Esto diluye los límites de responsabilidad, dificulta pruebas aisladas y convierte cambios pequeños en modificaciones de alto riesgo.

## 2. Decision drivers

- Mantenimiento comprensible a largo plazo.
- Correspondencia visible entre arquitectura, ficheros y pruebas.
- Cambios localizados sin efectos laterales entre componentes.
- Análisis estático, cobertura y revisión de código por responsabilidad.
- Cumplimiento explícito de la indicación del usuario.

## 3. Considered options

1. Un único HTML autocontenido con estilos y scripts inline.
2. Separar solo HTML/CSS/JavaScript, manteniendo toda la lógica en un JavaScript general.
3. Separar activos y asignar un módulo primario independiente a cada componente arquitectónico.

## 4. Decision

Adoptar la opción 3. `dashboard.html` no tendrá CSS ni JavaScript inline; `dashboard.css`, `dashboard-config.js` y `app.js` tendrán funciones exclusivas. CMP-02 a CMP-06 dispondrán de un módulo primario propio. CMP-01 separará launcher, servidor y configuración por tecnología. Cada módulo tendrá prueba homónima y exports nombrados mínimos.

Un helper solo se extraerá cuando tenga contrato/pruebas independientes o evite que el módulo primario supere 400 líneas de código propio. No podrá combinar responsabilidades de componentes ni crear imports circulares.

## 5. Consequences

### Positive

- Arquitectura, propiedad del código y cobertura resultan trazables por fichero.
- Los cambios permanecen localizados y las revisiones son más pequeñas.
- CSP puede prohibir código inline sin excepciones.

### Negative

- Aumenta el número de ficheros y requiere un composition root explícito.
- Los contratos entre módulos deben mantenerse estables y documentados.
- Dividir en exceso sigue siendo un riesgo; el umbral y la responsabilidad limitan helpers innecesarios.

## 6. Links / Evidence

- Design: §§2.1 y 3.
- Requirements: NFR-08 y NFR-10.
- User design feedback recorded in `design.md` §14.
