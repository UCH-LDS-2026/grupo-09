# Contract: Versionado, Comparacion e Informes

Este contrato describe la superficie esperada sin fijar implementacion final. Los nombres pueden adaptarse al estilo actual de rutas en espanol.

## Versionado

### Crear version

Entrada conceptual:

```json
{
  "projectId": 123,
  "name": "baseline checkout",
  "description": "Antes de agregar cache",
  "snapshot": {
    "nodes": [],
    "edges": [],
    "traffic": 600,
    "requestProfile": {},
    "result": {}
  }
}
```

Salida conceptual:

```json
{
  "id": 10,
  "projectId": 123,
  "name": "baseline checkout",
  "createdAt": "2026-06-26T00:00:00.000Z"
}
```

Reglas:

- Requiere usuario autenticado.
- Requiere permiso sobre el proyecto.
- Valida limites de nodos, conexiones y valores numericos igual que proyectos.

### Listar versiones

Salida conceptual:

```json
[
  {
    "id": 10,
    "name": "baseline checkout",
    "summary": "600 req/s, error 4.2%, costo $120",
    "createdAt": "2026-06-26T00:00:00.000Z"
  }
]
```

## Comparacion

Entrada conceptual:

```json
{
  "baseVersionId": 10,
  "candidateVersionId": 11
}
```

Salida conceptual:

```json
{
  "metricDeltas": {
    "latencyMs": -20,
    "throughputRps": 140,
    "errorRate": -0.04,
    "monthlyCost": 40,
    "incomingMBps": 0,
    "bottleneckChanged": true
  },
  "structuralChanges": {
    "addedNodes": [],
    "removedNodes": [],
    "modifiedNodes": [],
    "addedEdges": [],
    "removedEdges": []
  },
  "conclusion": "Mejora tecnica con aumento moderado de costo"
}
```

Reglas:

- Ambas versiones deben pertenecer al mismo proyecto.
- La comparacion no modifica snapshots.

## Informe tecnico

Entrada conceptual:

```json
{
  "sourceType": "version_or_comparison",
  "sourceId": "10-or-10:11"
}
```

Salida conceptual:

- HTML imprimible o documento descargable.
- Incluye inputs, arquitectura, resultados, conclusion y limitaciones.

Reglas:

- No requiere dependencia PDF en primera fase.
- Debe poder generarse desde datos ya autorizados para el usuario.
