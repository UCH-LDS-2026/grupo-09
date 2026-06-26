# Modelo de simulación

## Tamaño efectivo de request

La simulación trabaja con un tamaño promedio efectivo en KB. Si no se configuran valores nuevos, usa estos defaults para mantener compatibilidad con proyectos anteriores:

- `averageRequestSizeKb = 5`
- `heavyRequestPercentage = 0`
- `heavyRequestSizeKb = 50`

La mezcla entre requests livianos y pesados se calcula así:

```txt
heavyFraction = heavyRequestPercentage / 100
effectiveSizeKb = averageRequestSizeKb * (1 - heavyFraction) + heavyRequestSizeKb * heavyFraction
```

Ejemplo: si el promedio liviano es 5 KB, el 20% de requests pesa 50 KB y el 80% restante queda en 5 KB, el tamaño efectivo es 14 KB.

## Tráfico de red

La unidad principal del modelo es MB/s para evitar mezclar bytes y bits. A partir de RPS y tamaño efectivo:

```txt
incomingMBps = (trafficRps * effectiveSizeKb) / 1024
throughputMbps = incomingMBps * 8
```

MB/s sirve para leer volumen de datos. Mbps sirve para comparar contra el ancho de banda configurado en cada nodo.

## Saturación por RPS y por bandwidth

Cada nodo puede saturarse por dos razones independientes:

```txt
saturatedByRps = currentRps > node.capacity * node.instances
saturatedByBandwidth = incomingMBps * 8 > node.bandwidthMbps * node.instances
```

La razón final queda en uno de estos valores:

- `none`: el nodo está dentro de RPS y bandwidth.
- `rps`: faltan req/s de capacidad de procesamiento.
- `bandwidth`: los requests son demasiado pesados para el ancho de banda disponible.
- `rps_and_bandwidth`: ambas restricciones se exceden a la vez.

Para calcular cuánto puede procesar realmente el nodo, el motor toma el mínimo entre capacidad por RPS y capacidad equivalente por bandwidth. Esto permite representar el caso importante de la fase: pocos RPS con requests muy grandes pueden saturar red aunque el nodo todavía tenga capacidad de procesamiento.

## Latencia progresiva

La latencia parte de `baseLatency` y empieza a penalizarse cuando el nodo supera 70% de utilizacion. Entre 70% y 100% crece con una curva, no con escalones fijos. Al llegar a saturacion queda acotada en 3x para evitar valores infinitos o dificiles de defender.

```txt
if load <= 0.7:
  latency = baseLatency
else:
  pressure = min(1, (load - 0.7) / 0.3)
  multiplier = 1 + 2 * pressure^3
  latency = baseLatency * multiplier
```

Ejemplo con `baseLatency = 20 ms`: bajo 70% se mantiene en 20 ms; cerca de 90% empieza a notarse mas; en 100% llega a 60 ms. La curva representa que los sistemas suelen degradarse lentamente al principio y mucho mas rapido cuando se acercan al limite.

## Compatibilidad

Los proyectos viejos no necesitan traer estos campos. Si faltan, el motor usa los defaults anteriores y cada tipo de nodo recibe un ancho de banda predeterminado. Con `heavyRequestPercentage = 0`, el comportamiento queda alineado con el modelo previo salvo que se configure un tamaño de request o bandwidth que haga visible la nueva restricción.
