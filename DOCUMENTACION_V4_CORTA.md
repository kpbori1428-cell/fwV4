# Arquitectura V4 Framework

V4 Framework es un paradigma radicalmente distinto a React o Vue. No usa Virtual DOM, compiladores, ni gestores de estado externos. Su filosofía central es el **mapeo directo, secuencial y autómata de un plano de datos (JSON) a propiedades nativas del DOM**.

## 1. Filosofía de Tres Capas Inflexibles
1. **JSON (Plano Ciego):** Única fuente de la verdad estructural, visual y lógica. No entiende cómo se ejecuta nada.
2. **JS (Constructor Autómata):** Motor Vanilla que lee el JSON secuencialmente y mapea valores al DOM.
3. **HTML (Escenario Mudo):** Inicia vacío y es construido/mutado en tiempo de ejecución.

## 2. Trazabilidad y Ciclo de Vida
El flujo interno arranca desde `index.html` delegando el control al motor:

1. **`engine.js` (Constructor):** Vacía el documento, carga `maestro.json` y usa un bucle recursivo (`recorrer()`) para crear elementos `<div>` vírgenes (árbol DOM).
2. **`maestro.js` (Ensamblador):** Filtra inteligentemente. Transforma datos como `"background": "red"` directamente en `elemento.style.setProperty("background", "red")` sin clases estáticas.
3. **`funcion.js` (Despachador):** Si `maestro.js` encuentra claves reservadas (`estado`, `condicion`, `texto`), invoca dinámicamente este módulo para delegar lógicas complejas.

## 3. Reactividad Nativa Desacoplada
V4 integra interactividad pura y desacoplada usando Eventos Nativos:

* **Gestión (`estado.js`):** Cada elemento gestiona sus estados. Al mutar, en lugar de recalcular un Virtual DOM, inyecta las propiedades del nuevo estado en el nodo y dispara un grito global: `document.dispatchEvent(new CustomEvent('v4-estado-cambiado', { detail: { id, estado } }))`.
* **Evaluación (`condicion.js`):** Patrón Observador. Escucha pasivamente los CustomEvents globales. Permite que un elemento evalúe lógicas complejas en el JSON (ej. "si el botón 1 y el switch 2 están activos, cambia mi estado a verde") sin intervención manual de JS.

## 4. Plugins Funcionales: El Sistema de 'Paletas'
Una 'Paleta' **NO es una plantilla CSS o un tema visual**. Son plugins matemáticos/lógicos (PLUS) para propiedades que CSS no puede calcular nativamente.
* Toda paleta real (como `texto`) incluye un `base.json` (fallbacks), un `visual.js` (lógica inyectable como generar arrays para gradientes) y un `editor.js`.
* *Regla:* Estilos estáticos simples van puros en el JSON. Paletas solo se justifican para transformaciones JS complejas.

## 5. El Ecosistema de Edición Modular
El rasgo más moderno del framework es su Editor Visual totalmente desacoplado.
* **El Inspector (`editor-app.js`):** No conoce las reglas del motor. Lee el JSON y carga nativas. Si encuentra una Paleta o Función, importa dinámicamente su módulo editor (`await import('./paletas/texto/editor.js')`).
* **Inyección UI:** Los módulos exponen sus propios controles UI colapsables y delegan un callback de actualización. La lógica de UI jamás se mezcla en el core del framework.
* **Persistencia (`server.js`):** Un backend ultraligero Node.js que recibe el nuevo JSON vía POST a `/guardar` y reescribe el Plano Ciego.
