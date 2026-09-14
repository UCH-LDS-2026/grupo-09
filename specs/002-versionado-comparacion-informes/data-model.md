# Data Model: Versionado, Comparacion e Informes

## ScenarioVersion

Representa una version inmutable de un proyecto.

Campos conceptuales:

- `id`: identificador de version.
- `projectId`: proyecto propietario.
- `name`: nombre visible de la version.
- `description`: descripcion opcional del cambio.
- `snapshot`: arquitectura completa en el momento de guardar.
- `simulationResult`: resultado disponible al crear la version o recalculado al abrirla.
- `createdBy`: usuario que creo la version.
- `createdAt`: fecha de creacion.

Reglas:

- Pertenece a un unico proyecto.
- Solo usuarios autorizados sobre el proyecto pueden verla.
- No debe mutar; si se cambia, se crea otra version.

## VersionSnapshot

Representa los datos necesarios para reconstruir una version.

Contenido:

- Nodos con ids cliente, tipo, posicion, instancias, capacidad, latencia, cola, timeout, costo y bandwidth.
- Conexiones con ids cliente, origen, destino y asincronia.
- Trafico entrante.
- Perfil de request.
- Resultado de simulacion global y por nodo, cuando exista.

Reglas:

- Debe incluir defaults para campos faltantes.
- Debe ser compatible con proyectos previos a versionado.

## VersionComparison

Resultado derivado entre dos `ScenarioVersion` del mismo proyecto.

Campos conceptuales:

- `baseVersionId`: version inicial.
- `candidateVersionId`: version comparada.
- `metricDeltas`: diferencias de latencia, throughput, error, costo, MB/s y bottleneck.
- `structuralChanges`: nodos/conexiones agregados, quitados o modificados.
- `conclusion`: mejora, empeoramiento o cambio mixto.

Reglas:

- Debe bloquear versiones de proyectos distintos.
- No necesita persistirse en primera entrega; puede calcularse bajo demanda.

## TechnicalReport

Documento exportable generado desde una version o comparacion.

Campos conceptuales:

- `title`: titulo del informe.
- `source`: version o comparacion.
- `inputs`: trafico, request profile y configuracion relevante.
- `results`: metricas principales.
- `architectureSummary`: resumen de nodos y conexiones.
- `recommendation`: accion sugerida.
- `limitations`: alcance honesto del modelo.
- `generatedAt`: fecha de generacion.

Reglas:

- No debe exponer secretos ni datos de otros usuarios.
- Debe ser entendible sin leer codigo.
