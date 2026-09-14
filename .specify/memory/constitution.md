<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- [PRINCIPLE_1_NAME] -> I. Planificacion Antes de Implementacion
- [PRINCIPLE_2_NAME] -> II. Motor Compartido como Fuente de Verdad
- [PRINCIPLE_3_NAME] -> III. Compatibilidad Hacia Atras
- [PRINCIPLE_4_NAME] -> IV. Tests y Linea Base Verificable
- [PRINCIPLE_5_NAME] -> V. Cambios Acotados y Defendibles
Added sections:
- Alcance Tecnico
- Flujo de Trabajo
Removed sections:
- Placeholder SECTION_2_NAME
- Placeholder SECTION_3_NAME
Templates requiring updates:
- .specify/templates/plan-template.md: pending; default gates remain generic
- .specify/templates/spec-template.md: pending; default structure is usable
- .specify/templates/tasks-template.md: pending; default task format is usable
Follow-up TODOs: none
-->
# Stressflow Constitution

## Core Principles

### I. Planificacion Antes de Implementacion
Toda mejora futura MUST empezar con una especificacion, un plan tecnico y tareas revisables
antes de tocar codigo funcional. La implementacion queda fuera de alcance hasta que el usuario
apruebe explicitamente el plan o una fase concreta.

### II. Motor Compartido como Fuente de Verdad
Las reglas de simulacion, validacion de grafo, defaults y calculos compartidos MUST vivir en
`shared/simulator-core.js` y su contrato tipado. Frontend y backend SHOULD consumir ese motor
en vez de duplicar formulas o reglas.

### III. Compatibilidad Hacia Atras
Los proyectos guardados anteriormente MUST seguir cargando. Todo campo nuevo requiere defaults
explicitos, normalizacion en backend/frontend y migracion o fallback documentado. Un cambio que
rompa contratos, endpoints o datos persistidos requiere aprobacion previa.

### IV. Tests y Linea Base Verificable
Cada cambio funcional MUST incluir pruebas proporcionales al riesgo. Las mejoras del simulador
SHOULD tener tests unitarios del motor y, cuando crucen varias capas, tests de integracion. Antes
de modificar codigo se debe conocer la linea base de `npm test`, `npm run build` y `npm run lint`.

### V. Cambios Acotados y Defendibles
Cada fase MUST tocar solo los archivos necesarios para el objetivo aprobado. No se agregan
dependencias ni abstracciones nuevas sin justificar el beneficio. Las formulas y decisiones del
simulador MUST poder explicarse en una defensa tecnica breve.

## Alcance Tecnico

Stressflow es una aplicacion React + TypeScript + Vite con backend Node.js + Express, MySQL y
motor compartido JavaScript. El producto es educativo y de diseno temprano: compara arquitecturas
distribuidas bajo carga con un modelo simplificado, no reemplaza k6, JMeter, Grafana ni calculadoras
cloud.

Las mejoras prioritarias deben reforzar:

- precision explicable del modelo de simulacion;
- trazabilidad entre UI, API, persistencia y motor compartido;
- experiencia de portfolio profesional sin prometer precision de produccion;
- documentacion alineada con el comportamiento real del codigo.

## Flujo de Trabajo

1. Auditar estado inicial y registrar resultados de test/build/lint.
2. Crear o actualizar artefactos Spec Kit en `specs/` para la mejora propuesta.
3. Revisar ambiguedades y criterios de aceptacion antes de implementar.
4. Implementar una fase por vez, manteniendo compatibilidad de datos.
5. Ejecutar `npm test`, `npm run build` y `npm run lint` al cierre de cada fase funcional.

## Governance

Esta constitucion gobierna las specs, planes y tareas generadas para Stressflow. Cualquier cambio
que contradiga un principio MUST documentar el motivo y ser aprobado antes de implementarse.

Versionado:

- MAJOR: cambio incompatible en principios o gobernanza.
- MINOR: principio o seccion nueva.
- PATCH: aclaraciones sin cambio semantico.

**Version**: 1.0.0 | **Ratified**: 2026-06-26 | **Last Amended**: 2026-06-26
