# Diagramas del TP2

Esta carpeta contiene los diagramas en formato Mermaid para pasarlos a draw.io, Mermaid Live Editor o ChatGPT.

## Archivos

- `class-diagram.mmd`: diagrama de clases UML del dominio.
- `use-case-diagram.mmd`: diagrama de casos de uso expresado como flowchart Mermaid.

## Como usarlos en draw.io

1. Abrir draw.io.
2. Ir a `Insert > Advanced > Mermaid`.
3. Copiar el contenido del archivo `.mmd`.
4. Insertar el diagrama.
5. Ajustar visualmente si hace falta.

## Nota sobre casos de uso

Mermaid no tiene un tipo nativo especifico para diagramas de casos de uso UML. Por eso el archivo `use-case-diagram.mmd` usa `flowchart` con actores, casos y relaciones `<<include>>` / `<<extend>>`.
