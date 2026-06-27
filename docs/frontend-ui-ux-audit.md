# Auditoria UI/UX Frontend - Stressflow

Fecha: 2026-06-26

## Objetivo

Unificar la mejora de experiencia de usuario para que Stressflow avance como producto de portfolio, sin crear planes paralelos desconectados. Este documento es la auditoria maestra de UI/UX y se conecta con `specs/002-versionado-comparacion-informes/tasks.md`.

## Alcance revisado

Superficies revisadas:

- Login y registro en `src/views/auth/LoginView.tsx`.
- Estado de sesion y carga inicial en `src/controllers/AppController.tsx`.
- Dashboard principal en `src/components/SimulatorDashboard.tsx`.
- Canvas, nodos, conexiones y paneles laterales.
- Panel de propiedades en `src/components/simulator/PropertiesPanel.tsx`.
- Conclusion del sistema en `src/components/simulator/SystemConclusion.tsx`.
- Estilos globales, tokens, grilla, motion y estados visuales en `src/styles.css`.
- Plan de versionado/comparacion/informes en `specs/002-versionado-comparacion-informes/`.

Limitacion de auditoria: Playwright no esta instalado en el repo y `js_repl` no esta disponible en esta sesion. Se corrio revision de codigo, estructura, flujos y validaciones existentes, pero falta una pasada E2E visual automatizada con screenshots desktop/mobile antes de afirmar QA visual completo.

## Diagnostico ejecutivo

Nota UI/UX actual para portfolio: **7.6/10**.

La identidad visual ya es reconocible: dark lab, grilla, nodos, flujo animado y metricas tecnicas. El producto se entiende como simulador, no como CRUD generico. El mayor problema no es estetico; es de experiencia: las acciones clave dependen mucho de hover, drag y paneles compactos. Para portfolio, la app necesita guiar mejor al evaluador en 3 minutos: cargar demo, entender que tocar, comparar resultados y exportar una conclusion.

Nota potencial con mejoras priorizadas: **9.2/10**.

## Hallazgos priorizados

### P0 - Bloqueantes para una experiencia defendible

No se detectaron bloqueantes visuales que impidan seguir usando el producto actual. Los riesgos P0 aparecen si las proximas features se agregan como paneles sueltos sin arquitectura comun.

1. **No hay QA visual/E2E automatizado**
   - Evidencia: `package.json` no incluye Playwright/Cypress ni script E2E.
   - Impacto: no podemos validar con evidencia real login, crear proyecto, editar nodo, guardar, versionar, comparar e informe en desktop/mobile.
   - Mejora: agregar una fase de QA visual con screenshots de desktop 1440, laptop 1280, tablet 768 y mobile 390 antes de cerrar las features de portfolio.

2. **El canvas depende demasiado de mouse/drag/hover**
   - Evidencia: desktop usa `draggable` y `onDragStart` en `SimulatorDashboard.tsx:726-735`; mobile usa botones horizontales en `SimulatorDashboard.tsx:796-815`, pero mover nodos sigue dependiendo de `onMouseDown/onMouseMove` en `SimulatorDashboard.tsx:817-827` y `SimulatorDashboard.tsx:918-931`.
   - Impacto: en mobile/tablet y teclado, el usuario puede crear componentes pero no tiene un flujo completo comodo para ordenar arquitectura.
   - Mejora: definir modo responsive: en mobile priorizar editar parametros/resultados y usar layout automatico o controles de posicion simples; en desktop mantener drag avanzado.

3. **Acciones destructivas sin confirmacion fuerte**
   - Evidencia: `clearCanvas` borra nodos al elegir menu en `SimulatorDashboard.tsx:545-558`; `deleteCurrentProject` se ejecuta desde menu en `SimulatorDashboard.tsx:663-670`; `Eliminar componente` se dispara directo en `PropertiesPanel.tsx:192-201`.
   - Impacto: alto riesgo de perdida accidental durante demos.
   - Mejora: usar confirmacion explicita para borrar proyecto, limpiar canvas y eliminar componente con copy orientado a recuperacion.

### P1 - Mejoras de alto impacto para portfolio

4. **Falta un flujo demo guiado**
   - Evidencia: el login comunica valor en `LoginView.tsx:60-69`, pero el dashboard abre directo al simulador sin un CTA de demo. El estado vacio solo dice que agregues componentes en `SimulatorDashboard.tsx:892-904`.
   - Impacto: un evaluador puede no descubrir rapidamente cache, red saturada, costos o cuello de botella.
   - Mejora: boton `Cargar demo` con escenarios: checkout saturado, cache optimizando, red saturada por payload pesado.

5. **La arquitectura de informacion del dashboard esta al limite**
   - Evidencia: topbar concentra proyecto, usuario, rol, selector, nuevo, guardar y menu en `SimulatorDashboard.tsx:574-681`. El componente tambien concentra estado, persistencia, permisos, canvas, simulacion y layout desde `SimulatorDashboard.tsx:128` en adelante.
   - Impacto: al agregar versionado/comparacion/informe, si se suman botones sueltos se va a fragmentar la UI.
   - Mejora: crear una estructura unica de workspace: barra de acciones y panel contextual con tabs `Propiedades`, `Versiones`, `Comparar`, `Informe`. La barra puede seguir agrupada como `Proyecto`, `Escenario`, `Entrega`.

6. **El panel flotante de trafico sigue usando hover/focus para mostrar controles**
   - Evidencia: `group-hover:max-h-64` y `group-focus-within:max-h-64` en `SimulatorDashboard.tsx:996-1030`.
   - Impacto: en desktop es elegante, pero en mobile queda siempre abierto por `max-lg:max-h-64`; en futuras features puede tapar canvas o competir con versionado.
   - Mejora: convertirlo en panel fijo compacto o drawer de escenario con controles siempre descubribles.

7. **No hay jerarquia clara para proximas features**
   - Evidencia: `tasks.md` ya planifica versionado, comparacion e informe, pero no existia una compuerta UI/UX comun previa.
   - Impacto: cada feature puede agregar su propia UI y crear tres experiencias separadas.
   - Mejora: antes de implementar US1, definir shell de experiencia: historial/versiones, comparador e informe como partes de un mismo flujo.

8. **Estados de carga/error son funcionales pero poco accionables**
   - Evidencia: carga de sesion solo dice `Verificando sesión...` en `AppController.tsx:8-13`; error global dice `Ocurrió un error inesperado. Probá de nuevo.` en `DefaultErrorComponent.tsx:30-33`; persistencia muestra toast en `SimulatorDashboard.tsx:685-699`.
   - Impacto: en portfolio los errores deben explicar que paso y que puede hacer el usuario.
   - Mejora: empty/loading/error states por contexto: proyectos, versiones, comparacion, informe, auth y persistencia.

9. **El fallback local de simulacion no es visible para el usuario**
   - Evidencia: el dashboard calcula localmente si falla la simulacion backend, pero el estado no diferencia `calculado localmente`, `backend no disponible`, `stale` o `recalculado`.
   - Impacto: un informe tecnico podria parecer validado por backend cuando en realidad usa fallback local. Para portfolio no es grave si se comunica, pero es mala UX si se oculta.
   - Mejora: agregar estado visible de calculo y bloquear/advertir informe cuando el resultado no fue recalculado de forma confiable.

10. **Accesibilidad parcial: buenos inputs, pero faltan nombres y alternativas en controles icon-only**

- Evidencia: login tiene labels correctos y `aria-label` para password en `LoginView.tsx:117-170`; toggles laterales usan `title` pero no `aria-label` en `SimulatorDashboard.tsx:1079-1094`; menu de tres puntos no tiene etiqueta visible/aria en `SimulatorDashboard.tsx:647-651`.
- Impacto: lectores de pantalla y navegacion por teclado quedan debiles.
- Mejora: agregar `aria-label`, focus visible consistente, roles/labels en canvas y controles de conexion.

### P2 - Pulido visual y consistencia

11. **Animaciones sin respeto a reduced motion**
    - Evidencia: `flow-line`, `pulse-glow` y `alert-blink` animan infinito en `src/styles.css:159-180`.
    - Impacto: puede molestar a usuarios sensibles al movimiento y dificulta screenshots limpios.
    - Mejora: agregar `@media (prefers-reduced-motion: reduce)` para desactivar o suavizar animaciones.

12. **Terminologia mezcla español/ingles en lugares visibles**
    - Evidencia: `Bandwidth` en `PropertiesPanel.tsx:31-36`; otras etiquetas usan español.
    - Impacto: reduce prolijidad de portfolio.
    - Mejora: normalizar a `Ancho de banda`, `RPS`, `MB/s`, `Mbps` con glosario corto en UI/informe.

13. **Nodos muestran metricas utiles pero comprimidas**
    - Evidencia: cada nodo muestra instancias, capacidad, carga, cola y error en `SimulatorDashboard.tsx:958-970`.
    - Impacto: bueno para expertos, denso para primera visita.
    - Mejora: modo compacto/expandido por nodo o tooltip/click explicativo que no dependa de hover.

14. **Panel de propiedades mezcla configuracion y resultado sin separador de decision**
    - Evidencia: Configuracion y Resultado en `PropertiesPanel.tsx:84-190`.
    - Impacto: al usuario le cuesta conectar `cambio este slider` con `mejora esta metrica`.
    - Mejora: agregar microcopy o delta futuro cuando exista comparacion: `este cambio sube capacidad total a...`.

## Plan maestro UI/UX unificado

Este plan debe ser la compuerta comun antes de implementar versionado, comparacion e informe. No crear planes paralelos por herramienta; Spec Kit, Codex y agentes trabajan desde `specs/002-versionado-comparacion-informes/tasks.md` y este documento.

### Semana 1 - Fundacion UX antes de nuevas features

Objetivo: que el simulador actual sea mas claro, seguro y demostrable.

1. Definir `Experience Shell`: action bar + panel contextual con tabs `Propiedades`, `Versiones`, `Comparar`, `Informe`, agrupado conceptualmente en `Proyecto`, `Escenario`, `Entrega`.
2. Crear componentes compartidos: `ExecutiveSummary`, `MetricDelta`, `StructuralChanges`, `ModelLimitations`.
3. Agregar estados UI estándar: empty/loading/error/success/unauthorized/stale simulation.
4. Agregar confirmaciones o deshacer para acciones destructivas.
5. Convertir controles de trafico en panel descubrible, no dependiente de hover.
6. Agregar `Cargar demo` con escenarios de valor.
7. Normalizar copy tecnico: RPS, MB/s, Mbps, ancho de banda, cuello de botella.
8. Agregar reduced motion, labels accesibles y navegacion de teclado minima.
9. Ejecutar QA manual desktop/mobile y dejar evidencia.

Criterio de cierre: un evaluador nuevo puede entrar, cargar demo, modificar un parametro, guardar y entender la conclusion sin asistencia.

### Semana 2 - Versionado + comparacion con UX integrada

Objetivo: que versiones y comparacion se sientan como parte natural del simulador.

1. Implementar versionado con panel `Historial de escenarios`.
2. Agregar estados vacios: sin versiones, version actual sin guardar, version guardada.
3. Implementar comparacion con cards de delta: latencia, error, throughput, costo, red y cuello de botella.
4. Mostrar cambios estructurales: nodos agregados/modificados/quitados.
5. Validar mobile/tablet con flujo de lectura y seleccion.

Criterio de cierre: se puede mostrar antes/despues en menos de 2 minutos.

### Semana 3 - Informe exportable + portfolio polish

Objetivo: convertir el resultado en una entrega profesional.

1. Crear vista de informe imprimible/HTML.
2. Incluir inputs, arquitectura, metricas, comparacion, recomendacion y limitaciones.
3. Agregar CTA desde `Entrega` en el shell.
4. Preparar README con flujo demo y capturas cuando exista QA visual.
5. Cerrar con tests, build, lint, audit y screenshots.

Criterio de cierre: el informe se puede abrir o imprimir y defender sin explicar el codigo.

## QA requerido

### Automatizado existente

- `npm test`
- `npm run build`
- `npm run lint`
- `npm run security:audit`

### QA faltante recomendado

- Instalar/aprobar Playwright o usar entorno browser equivalente.
- Capturar screenshots de:
  - login desktop/mobile;
  - dashboard default;
  - canvas vacio;
  - nodo seleccionado;
  - saturacion por RPS;
  - saturacion por bandwidth;
  - mobile con controles de escenario;
  - futuro versionado/comparacion/informe.
- Probar teclado: tab order, botones icon-only, sliders, menus y acciones destructivas.
- Probar reduced motion.

## Decision de producto

La proxima implementacion no deberia empezar directo por tablas de versionado. Primero conviene ejecutar la compuerta UI/UX: experiencia shell, demo, confirmaciones, accesibilidad base y plan visual para versionado/comparacion/informe. Eso evita que las tres mejoras queden pegadas como botones sueltos.

## Checklist manual de cierre - Fase de versionado

Registrar evidencia visual sin datos sensibles para cada viewport:

- [ ] Desktop 1440x900: barra contextual, canvas, controles de trafico y panel de propiedades sin solaparse.
- [ ] Laptop 1280x720: biblioteca y panel contextual redimensionables; canvas utilizable.
- [ ] Tablet 768x1024: biblioteca horizontal, tabs accesibles y panel contextual debajo del canvas.
- [ ] Mobile 390x844: acciones envuelven sin recorte, tabs tienen scroll y controles no salen del viewport.
- [ ] Teclado: componentes de biblioteca y nodos se seleccionan con Enter/Espacio; botones icon-only tienen nombre accesible.
- [ ] Reduced motion: flujo, pulso y alertas quedan estaticos con `prefers-reduced-motion: reduce`.
- [ ] Destructivas: borrar proyecto, limpiar canvas y eliminar componente requieren confirmacion.
- [ ] Versionado: estado vacio, carga, error, creacion exitosa y vista historica de solo lectura son distinguibles.
- [ ] Motor: se diferencia backend, fallback local, recalculo y snapshot historico.
