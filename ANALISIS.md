# Análisis del Framework V4

El framework V4 es un sistema basado en JSON para construir interfaces web. Sigue una filosofía estricta de 3 capas:
1. **JSON**: La fuente de la verdad (El Plano Ciego).
2. **JS**: El motor que ensambla la UI (El Constructor Autómata).
3. **HTML**: La representación visual (El Escenario Mudo).

## Trazabilidad entre Archivos

La arquitectura se articula desde un punto de entrada principal y se expande para construir todo el árbol DOM dinámicamente.

1. **`index.html`**: El punto de entrada inicial. Arranca casi vacío (sin DOM predefinido) y carga `engine.js`.
2. **`engine.js`**: El núcleo del framework.
    - Limpia el DOM y define el ciclo de vida del estado (`vacio` -> `dinamico` -> `completo`).
    - Pide y carga el archivo maestro (`maestro.json`).
    - Inicia un recorrido recursivo por el JSON. Para cada nivel y clave (ignorando las palabras reservadas de funciones en primer nivel), crea un `<div id="...">` en base al nombre de la clave.
    - Delega la tarea de aplicar estilos e inyectar configuraciones a ese `div` mediante `construirNodo` ubicado en `maestro.js`.
3. **`maestro.js`**: Actúa como un ensamblador autómata.
    - Recibe un objeto (las claves del JSON de ese nodo específico) y un elemento del DOM (`div`).
    - Si la clave dentro de ese nivel es una **palabra reservada**, corta su proceso de aplicación de estilos estándar e invoca a `ejecutar()` de `funcion.js`.
    - Si el valor de esa clave es otro objeto y no es una palabra reservada, asume que es una nueva rama de un sub-contenedor que `engine.js` procesará más adelante.
    - Si la clave no es un objeto ni una palabra reservada, asume que es una **propiedad nativa** y la inyecta directamente como un estilo CSS en línea: `elemento.style.setProperty(clave, valor)`.
4. **`funcion.js`**: El router y registro central.
    - Mantiene diccionarios de las claves reservadas (`reservadas` y `paletas`).
    - Al invocarse, redirige el flujo de ejecución hacia el módulo lógico visual encargado de esa palabra reservada en específico (sea de una función en la carpeta `funciones/` o de una paleta en la carpeta `paletas/`).
5. **Paletas (`paletas/`)**: Componentes prediseñados y encapsulados.
    - Ejemplo en el framework: `paletas/texto/`.
    - **`visual.js`**: El encargado de renderizar. Si el maestro le delega el control, primero busca propiedades base por defecto (`base.json`), si no vienen configuradas por el usuario, las asume. Luego aplica el resto de propiedades que sí envió el usuario, y procesa propiedades opcionales o complejas extra (`plus`).
    - **`base.json`**: Define los estilos obligatorios por default.
    - **`plus.json`**: Define la estructura de las opciones avanzadas (ej. `gradiente-texto`).
    - **`editor.js`**: Componente exclusivo del entorno de edición (ver más abajo).
6. **Funciones (`funciones/`)**: Añaden lógica o reactividad a los componentes en el frontend.
    - Ejemplo: `funciones/estado/estado.js`.
    - No definen estructura base, pero definen variables, acciones (event listeners como `click`, `mouseenter`, `mouseleave`) y reacciones que conmutan estilos CSS basados en un estado interno.
7. **Entorno del Editor (`editor.html` y `editor-app.js`)**:
    - Un entorno visual para modificar la fuente de la verdad (`maestro.json`).
    - `editor-app.js` carga `maestro.json` y construye un árbol de navegación de la estructura.
    - Muestra la página web resultante a través de un `iframe` que carga `index.html`.
    - Al seleccionar un nodo en el árbol, destaca el elemento visualmente y renderiza propiedades y herramientas para su edición.
    - Usa un servidor simple de Node.js (`server.js`) para guardar las configuraciones de vuelta al disco vía HTTP POST.
8. **`server.js`**:
    - Servidor HTTP simple (sin Express) que sirve los recursos estáticos y un endpoint POST (`/guardar`) que sobrescribe `maestro.json` con los cambios del editor.

## Uso de Propiedades Nativas

El framework procesa CSS directo para simplificar y aligerar el trabajo. Toda clave que no figure en el registro de funciones o paletas y que no sea un objeto anidado, se asume como una regla CSS válida.
- **Funcionamiento**: En `maestro.js`, se ejecuta una llamada a la API del DOM `elemento.style.setProperty(clave, valor)`. Por ejemplo, `"background": "#0a0a0f"` se traduce directamente en `div.style.background = "#0a0a0f"`.
- En el editor, las propiedades nativas encontradas se mapean a controles HTML básicos como `<input type="text">` o `<input type="color">`, permitiendo ediciones simples y directas que se reflejan en tiempo real.

## Uso de Claves Reservadas

Las claves reservadas son nombres de propiedades definidos en el JSON que alteran el flujo lineal de construcción del DOM de `maestro.js`.
- Al encontrar una clave reservada en el recorrido de estilos de un nodo, `maestro.js` se salta aplicar eso como CSS nativo y le delega el control a `funcion.js`.
- Si `funcion.js` tiene esa clave en su diccionario de `reservadas`, invoca su código asociado, enviándole el valor, el elemento DOM correspondiente y la ruta de anidación.
- Dos grandes ejemplos actuales:
  - **`texto`**: Invoca el visual de la paleta de texto, permitiendo renderizar una cadena de caracteres o añadir estilos como degradados al texto.
  - **`estado`**: Invoca la función de estado, añadiendo listeners de eventos interactivos para conmutar las reglas CSS.

## Funciones y Paletas

El framework distingue entre lo estático prediseñado y la lógica reactiva:
- **Paletas (`paletas/`)**: Son módulos visuales completos. Si el JSON menciona una paleta, `funcion.js` invoca a su `visual.js`. Este a su vez carga `base.json` para inyectar propiedades CSS por defecto si el usuario omitió darlas, evitando que el elemento se rompa. Además, si el JSON especifica propiedades del tipo "plus", procesa lógicas más complejas (ej. convertir un gradiente lineal de texto a una propiedad CSS compleja de webkit).
- **Funciones (`funciones/`)**: Son decoradores de lógica reactiva para nodos existentes. La función `estado.js` registra un handler en el sistema global. Cuando el JSON declara una clave `"estado"`, la función guarda el estado actual, las reacciones (un objeto CSS con las reglas de cada estado) y añade `eventListeners` nativos del DOM (`hover`, `click`). Al dispararse el evento, se limpian las propiedades CSS del estado anterior y se aplican las nuevas.

## Editor y Controles Especializados

El editor es la interfaz que retroalimenta la filosofía de "texto puro":
- **Funcionamiento del Editor**:
    - `editor-app.js` maneja la interfaz `editor.html`.
    - Recrea recursivamente el árbol anidado del JSON para mostrarlo en el menú de navegación (`#panel-arbol`).
    - Al hacer click en el árbol o dentro del iframe, el editor identifica el elemento usando un atributo de datos `data-path` (ej. `contenedor.cont1.subcont1`).
    - Genera el menú derecho ("Inspector") dinámicamente:
        - Itera sobre las llaves del nodo: Si el valor es de texto o número, infiere que es una **propiedad nativa** y genera un campo para editarlo.
        - Si el valor es un objeto y coincide con una **clave reservada** (ej. es una paleta como `texto`), el editor intenta importar dinámicamente un archivo específico: `./paletas/{clave}/editor.js` o `./funciones/{clave}/editor.js`.
- **Controles Especializados (Plus)**:
    - Cuando se carga el archivo `editor.js` de una paleta, este devuelve elementos DOM configurados como una herramienta a la medida (controles "Plus").
    - Por ejemplo, el `editor.js` de la paleta de texto devuelve un control de sliders (deslizadores) de rango para elegir los porcentajes y ángulos de los degradados, o un set de `color pickers` encadenados.
    - Estos componentes especializados poseen *callbacks* (eventos onCambio) que modifican en tiempo real la referencia del objeto `maestro.json` en memoria de la interfaz, recargando simultáneamente el iframe (`actualizarPreview()`) para que los cambios se rendericen instantáneamente.
