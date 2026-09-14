Actuá como frontend senior especializado en UI/UX SaaS minimalista.

Estoy trabajando en el proyecto StressFlow. Es una app web para simular arquitecturas distribuidas bajo carga. Actualmente la pantalla principal funciona, pero visualmente está sobrecargada: demasiado neón, demasiados bordes, mucha información visible al mismo tiempo, paneles pesados y poco aire visual.

Objetivo:
Refactorizar la interfaz para que se vea mucho más limpia, minimalista, profesional y tipo SaaS técnico moderno, sin romper ninguna funcionalidad existente.

IMPORTANTE:
- No cambies la lógica del simulador.
- No rompas el backend ni los endpoints.
- No elimines funcionalidades.
- No cambies nombres de rutas ni estructuras críticas si no hace falta.
- Priorizá UI/UX, composición visual, jerarquía, espaciado y claridad.
- Antes de modificar, inspeccioná los componentes actuales y detectá dónde está cada parte de la pantalla.
- Hacé cambios incrementales y seguros.

Estilo visual deseado:
- Dark mode profesional.
- Menos glow/neón.
- Menos bordes fuertes.
- Más aire entre secciones.
- Paleta reducida: fondo oscuro, cards oscuras, texto blanco/gris, cian solo para acciones principales o elementos seleccionados.
- Sensación tipo herramienta técnica moderna, no dashboard gamer.
- Minimalista, sobrio, limpio.

Cambios concretos que quiero:

1. Reducir el exceso de neón
Actualmente muchos elementos tienen sombra, glow o borde cian. Quiero que el cian se use solo para:
- botón activo
- nodo seleccionado
- conexión activa
- métrica crítica
- acción principal

El resto debe usar bordes sutiles tipo:
rgba(255,255,255,0.06) o similar.

Evitar box-shadow fuertes. Usar sombras muy suaves o directamente ninguna.

2. Simplificar las tarjetas de nodos del canvas
Cada nodo debe mostrar solo lo esencial:
- icono
- nombre del componente
- estado
- carga principal
- error si corresponde
- barra de carga simple

Toda la información técnica detallada debe quedar en el panel derecho, no dentro del nodo.

Ejemplo de nodo ideal:
[icono] Servicio de aplicación       ● Estable
Carga 50% · Error 0%
[barra]

No quiero que el nodo muestre demasiados datos como capacidad, cola, r/s, error, etc. Todo eso va al detalle lateral.

3. Bajar protagonismo de la grilla del canvas
La grilla actual se ve demasiado fuerte. Reducir opacidad y contraste.
Debe sentirse como ayuda visual de fondo, no como elemento principal.

4. Hacer el panel inferior “Conclusión del sistema” más minimalista
Actualmente ocupa mucho espacio y tiene demasiada información visible.

Quiero que por defecto sea una barra/resumen compacto:
Conclusión: estable · carga 50% · error 0% · cuello: Servicio de aplicación

Y que tenga un botón para expandir:
“Ver análisis completo”

Cuando se expande, puede mostrar el detalle actual:
- carga
- saturación
- cola
- error
- red
- causa
- acción
- recomendación
- costo mensual

Pero cerrado debe ocupar poco espacio y dejar respirar el canvas.

5. Ordenar el panel derecho según la pestaña activa
El panel derecho debe sentirse limpio.

Para “Propiedades”:
- Header simple del nodo seleccionado.
- Estado.
- Configuración básica visible:
  - nombre
  - instancias
  - capacidad
- Configuración avanzada colapsable:
  - latencia
  - cola
  - ancho de banda
  - timeout
  - costo
- Resultado en cards pequeñas y limpias.

Para “Versiones”:
- Mostrar guardar versión de manera simple.
- Historial con empty state limpio.
- Menos cajas, menos bordes.

Para “Comparar”:
- Empty state simple.
- Explicación corta.
- Sin cards innecesariamente grandes.

Para “Informe”:
- Mostrar estado claro.
- Si todavía no está disponible, usar una card simple.
- El aviso amarillo debe ser más discreto, no tan pesado visualmente.

6. Panel izquierdo más liviano
La biblioteca de componentes debe verse más compacta.
Reducir altura de items.
Reducir bordes.
Menos separación excesiva.
Mantener icono + nombre.

La sección de conexiones debe quedar más discreta abajo.

7. Topbar más limpia
La barra superior debe tener jerarquía:
- Proyecto actual
- Rol
- Selector de proyecto
- Acciones: cargar demo, nuevo, guardar

Evitar que todos los botones tengan el mismo peso.
Guardar debe ser el botón principal.
Los demás pueden ser ghost buttons.

8. Tabs más minimalistas
Las tabs “Propiedades”, “Versiones”, “Comparar”, “Informe” deben verse más limpias:
- activa con fondo sutil o borde inferior
- inactivas con texto gris
- menos borde cian completo
- menos altura si es posible

9. Panel de tráfico más compacto
La card flotante de tráfico está bien ubicada, pero hacerla más compacta:
- Título: Tráfico
- Valor: 600 req/s · 5 KB
- Dos sliders simples
- Menos texto secundario
- Menos borde/glow

10. Crear o ajustar tokens de diseño
Si el proyecto usa Tailwind, centralizar clases/reutilizar variables donde convenga.

Valores deseados aproximados:
- background principal: muy oscuro
- paneles: oscuro apenas más claro
- bordes: blanco con opacidad baja
- texto primario: casi blanco
- texto secundario: gris azulado
- acento: cian, pero usado con moderación
- radius: 12px / 16px
- spacing consistente

11. Mantener responsive
La pantalla debe seguir funcionando en desktop.
Priorizar 1366x768 y 1920x1080.
Evitar que el panel inferior tape nodos importantes.
Evitar scroll innecesario dentro de toda la página si se puede.

12. Agregar modo visual más limpio para demo si es fácil
Si no es complejo, agregar un botón o estado “Modo demo” / “Vista limpia” que oculte o colapse:
- panel izquierdo
- panel derecho
- conclusión expandida

Pero esto es opcional. Priorizar primero limpiar la interfaz principal.

Criterios de aceptación:
- La app sigue funcionando igual.
- Se pueden seguir agregando componentes.
- Se pueden seguir conectando nodos.
- Se siguen viendo propiedades.
- Se siguen guardando versiones.
- Se mantiene comparar e informe.
- La interfaz se ve más simple, con menos glow, menos texto visible y mejor jerarquía.
- El canvas respira más.
- Los detalles técnicos aparecen en panel derecho, no todos en el canvas.
- No hay errores en consola.
- El build corre correctamente.

Proceso:
1. Inspeccioná la estructura del frontend.
2. Identificá los componentes principales de la pantalla.
3. Hacé un plan corto de cambios.
4. Aplicá el refactor visual.
5. Ejecutá lint/build/test si existen.
6. Mostrame un resumen final con:
   - archivos modificados
   - mejoras aplicadas
   - cosas que no tocaste
   - próximos refinamientos posibles

Prioridad:
Primero limpiar visualmente.
Segundo ordenar jerarquía.
Tercero mejorar detalles finos.
No hacer refactors grandes innecesarios.