# Análisis del Framework V4

El framework V4 es un sistema basado en JSON para construir interfaces web. Sigue una filosofía estricta de 3 capas:
1. **JSON**: La fuente de la verdad (El Plano Ciego).
2. **JS**: El motor que ensambla la UI (El Constructor Autómata).
3. **HTML**: La representación visual (El Escenario Mudo).

## Trazabilidad entre Archivos

1. **`index.html`**: El punto de entrada. Inicia vacío y carga `engine.js`.
2. **`engine.js`**:
    - Limpia el DOM y define el estado (`vacio` -> `dinamico` -> `completo`).
    - Carga `maestro.json`.
    - Itera sobre el JSON recursivamente. Crea un árbol de `<div>` basándose en la estructura de llaves.
    - Delega la configuración de cada nodo a `construirNodo` en `maestro.js`.
3. **`maestro.js`**:
    - Por cada llave/valor de un nodo en el JSON:
        - Si la llave es una **palabra reservada**, invoca a `funcion.js` (`ejecutar()`) y detiene el procesamiento de esa llave.
        - Si el valor es un objeto, lo ignora (es un sub-contenedor manejado recursivamente por `engine.js`).
        - Si no es nada de lo anterior, asume que es una **propiedad CSS nativa** y la aplica directamente (`elemento.style.setProperty`).
4. **`funcion.js`**:
    - Un registro central (`reservadas` y `paletas`).
    - Las paletas y funciones se registran aquí.
    - Redirige la ejecución al módulo visual correspondiente de una paleta o función (ej. `paletas/texto/visual.js` o `funciones/estado/estado.js`).
5. **Paletas (`paletas/`)**:
    - Componentes pre-diseñados (ej. `texto`).
    - **`visual.js`**: Lógica para renderizar la paleta en el DOM. Carga defaults de `base.json`, aplica propiedades recibidas y maneja propiedades opcionales (`plus.json`).
    - **`base.json`**: Defaults CSS de la paleta.
    - **`plus.json`**: Estructura de propiedades extra/complejas.
    - **`editor.js`**: Controles de UI específicos para el editor, para manejar las propiedades "plus".
6. **Funciones (`funciones/`)**:
    - Comportamientos (ej. `estado`).
    - **`estado.js`**: Maneja estados reactivos (hover, click, etc.) y aplica estilos dinámicamente según el estado.
7. **`editor.html` y `editor-app.js`**:
    - Interfaz para editar el JSON visualmente.
    - Carga `maestro.json`, muestra un árbol y renderiza una vista previa en un iframe (`index.html`).
    - Al seleccionar un nodo, crea inputs dinámicos para **propiedades nativas** y, si el nodo es una paleta, carga su `editor.js` para los controles **plus**.
    - Permite guardar los cambios enviándolos a `server.js`.
8. **`server.js`**: Un servidor Node básico para servir archivos y guardar cambios en `maestro.json`.

## Propiedades Nativas

El framework soporta cualquier propiedad CSS estándar (ej. `width`, `color`, `display`, `padding`, `border-radius`).
- Si una llave en el JSON no es una palabra reservada ni un objeto, `maestro.js` la inyecta directamente como un estilo CSS en línea: `elemento.style.setProperty(clave, valor)`.
- En el editor, estas se manejan automáticamente generando `<input type="text">` o `<input type="color">`.

## Claves Reservadas

Son llaves en el JSON que disparan un comportamiento especial en lugar de aplicarse como CSS o crear un contenedor.
- Son interceptadas en `maestro.js` y procesadas por `funcion.js`.
- Ejemplos actuales:
    - **`texto`**: Invoca a `paletas/texto/visual.js`. Construye contenido de texto y aplica estilos especiales (como `gradiente-texto`).
    - **`estado`**: Invoca a `funciones/estado/estado.js`. Añade lógica de hover/click para cambiar entre diferentes sets de estilos.

## Funciones y Paletas

- **Paletas**: Componentes visuales. Tienen propiedades por defecto (`base.json`), un renderizador en cliente (`visual.js`), controles de edición específicos (`editor.js`), y propiedades especiales complejas. Ejemplo: La paleta `texto` tiene la propiedad especial `gradiente-texto`.
- **Funciones**: Lógica no puramente visual que altera el comportamiento del componente. Ejemplo: La función `estado` permite definir eventos (`click`, `hover`) que transicionan propiedades CSS.

## Editor y Controles Especializados

1. **Árbol**: El editor (`editor-app.js`) recorre recursivamente `maestro.json` (ignorando `head`) y crea una lista jerárquica de la estructura.
2. **Selección**: Al hacer clic en un nodo del árbol, resalta el elemento correspondiente en el iframe y muestra el inspector.
3. **Inspector**:
    - Detecta si el nodo contiene llaves simples (valores string/numéricos) y crea "Controles Nativos" automáticamente (inputs de texto o color).
    - Detecta si el nodo es un objeto que coincide con una "Clave Reservada" (como una paleta). Si lo es, intenta cargar asíncronamente `./paletas/{clave}/editor.js` o `./funciones/{clave}/editor.js`.
4. **Controles Especializados (`plus`)**:
    - Si se carga un `editor.js` de una paleta, este devuelve un bloque HTML con inputs diseñados a medida (ej. sliders para dirección del gradiente, múltiples pickers para los colores de un gradiente).
    - Estos controles actualizan el objeto JSON directamente mediante un callback y re-renderizan/aplican el estilo visualmente.
