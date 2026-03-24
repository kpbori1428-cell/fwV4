# Documentación Descriptiva y Arquitectura de V4 Framework

## Introducción: La Modernidad de V4 Framework

V4 Framework no es simplemente una biblioteca más de componentes UI o un wrapper de JavaScript; es un paradigma completamente nuevo y disruptivo. A diferencia de frameworks tradicionales (como React o Vue) que dependen de un Virtual DOM costoso y complejos ciclos de vida, V4 aborda la renderización desde una filosofía radicalmente diferente: **el mapeo directo y secuencial de un plano de datos (JSON) a propiedades nativas del DOM**.

La integridad de esta tecnología reside en su **separación absoluta de responsabilidades** (capas con roles inflexibles) y su capacidad para reutilizar nodos y sobreescribir estilos sin destruir o recrear elementos en memoria constantemente. El resultado es un motor de altísimo rendimiento con cero dependencias externas, capaz de generar interactividad compleja mediante un consumo de hardware microscópico.

---

## 1. Filosofía Arquitectónica: Las Tres Capas

La arquitectura central se divide en tres actores con roles absolutos:

1. **JSON (El Plano Ciego):** Contiene la data estructural y visual. Carece de consciencia sobre su ejecución.
2. **JS (El Constructor Autómata):** Lee secuencialmente y mapea el JSON a elementos. No entiende el propósito semántico del sitio.
3. **HTML (El Escenario Mudo):** Solo exhibe el resultado. Inicia completamente vacío y no retiene memoria de las instrucciones que lo construyeron.

---

## 2. Trazabilidad Secuencial: El Ciclo de Vida de V4

A continuación, se detalla paso a paso la comunicación interna de los archivos desde que el usuario ingresa a la página web.

### Paso 1: El Escenario Mudo (`index.html`)

Todo comienza cuando el usuario ingresa a la ruta raíz. El archivo `index.html` se presenta casi vacío, declarando únicamente su estado inicial en los atributos nativos y delegando el poder total al constructor autómata.

*Fragmento de `index.html`:*
```html
<!DOCTYPE html>
<html lang="es" data-v4-estado="vacio">
<!-- EL SCRIPT AFUERA DEL BODY: PODER TOTAL -->
<script type="module" src="engine.js"></script>
</html>
```
Al cargar el script fuera del `<body>`, se otorga a `engine.js` el control total sobre la manipulación del Document Object Model (DOM) desde cero.

### Paso 2: El Despertar del Motor (`engine.js`)

El archivo `engine.js` es el núcleo estructural. Inicia purgando el documento y solicitando el plano maestro. Inicia un bucle recursivo (`recorrer`) que genera elementos `<div>` vírgenes y delega la tarea de **vestirlos** al Ensamblador (`maestro.js`).

*Fragmento de la creación del árbol (`engine.js`):*
```javascript
function recorrer(config, parent, prefijo) {
    for (const clave in config) {
        if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
            const div = document.createElement('div');
            construirNodo(valor, div, path); // DELEGACIÓN A MAESTRO.JS
            parent.appendChild(div);
            recorrer(valor, div, path); // RECURSIVIDAD DESCENDENTE
        }
    }
}
```

### Paso 3: El Ensamblaje y Filtrado (`maestro.js`)

`maestro.js` aplica un filtrado riguroso. Mapea propiedades nativas o deriva lógicas complejas a `funcion.js`.

*Fragmento del filtrado inteligente (`maestro.js`):*
```javascript
export function construirNodo(config, elemento, path) {
    for (const clave in config) {
        // 1. FILTRO DE FUNCIONES: Si es reservada, delega al despachador.
        if (esReservada(clave)) { ejecutar(clave, valor, elemento, path); continue; }

        // 3. FILTRO DIRECTO NATIVO: El motor no piensa, mapea a CSS nativo.
        elemento.style.setProperty(clave, valor);
    }
}
```

### Paso 4: El Despachador de Especialidades (`funcion.js`)

Si `maestro.js` encuentra una palabra clave reservada (`estado`, `condicion`, `texto`), interviene `funcion.js`, despachando la acción al módulo visual o lógico respectivo de manera dinámica.

---

## 3. Lógica Reactiva Global: El Puente `estado.js` y `condicion.js`

El framework cuenta con reactividad integrada a nivel nativo mediante **Custom Events**.

### La Gestión del Estado (`estado.js`)
Cuando un elemento cambia de estado, sobrescribe sus propiedades y emite un evento global.

*Fragmento de emisión global (`estado.js`):*
```javascript
document.dispatchEvent(new CustomEvent('v4-estado-cambiado', {
    detail: { id, estado: nuevoEstado }
}));
```

### El Evaluador Lógico Híbrido (`condicion.js`)
Actúa como un Patrón Observador, evaluando reglas locales y reactivas (escuchando el evento `v4-estado-cambiado`), logrando una lógica condicional puramente definida en JSON.

---

## 4. El Sistema de Paletas: Plugins Funcionales 'PLUS'

Las **Paletas** no son plantillas CSS. Son **plugins funcionales avanzados** que calculan propiedades (PLUS) que no existen en CSS nativo y cargan fallbacks básicos desde un `base.json`.

*Fragmento de paleta de texto calculando interpolación matemática (`paletas/texto/visual.js`):*
```javascript
if (config['gradiente-texto']) {
    const stops = g.colores.map((c, i) => `${c} ${g.posiciones[i]}%`).join(', ');
    elemento.style.backgroundImage = `linear-gradient(${g.direccion}, ${stops})`;
}
```

*(Nota técnica: El framework se basa en paletas funcionales puras como `texto`. Implementaciones estáticas o similares a plantillas sin lógica profunda —como iteraciones obsoletas de "tarjetas"— han sido descartadas ya que no siguen la filosofía dinámica del sistema.)*

---

## 5. El Ecosistema de Edición: Modularidad Total sin Asunciones

El rasgo más moderno del framework es que **el Entorno de Edición está tan desacoplado como el Motor Visual**. El editor web (`editor.html` y `editor-app.js`) construye una interfaz visual dinámica consultando al propio framework qué capacidades posee cada elemento.

### A. El Inspector Dinámico (`editor-app.js`)
El editor no "sabe" qué módulos o paletas existen. Lee el JSON Maestro y mapea automáticamente el CSS. Cuando detecta una "paleta" o "función", importa dinámicamente su módulo de editor (`editor.js`) sin sobrecargar el core.

*Fragmento de carga dinámica (`editor-app.js`):*
```javascript
// Intentar cargar editor de paleta o función
let editorMod = null;
try {
    editorMod = await import(`./paletas/${clave}/editor.js`);
} catch (e) {}
```
Si el módulo (ej. estado, condicion, texto) expone un editor, se inyecta su UI (PLUS) de manera colapsable (Acordeón) para no colisionar con las propiedades nativas CSS. Esto permite aplicar simultáneamente un módulo lógico (ej. `condicion.js`) y una paleta visual (ej. `texto.js`) al mismo `div`.

### B. Los Editores Específicos (`editor.js`)
Cada módulo (por ejemplo `paletas/texto/editor.js` o `funciones/condicion/editor.js`) implementa su propio `construirControles(...)`. Ellos exponen su propia UI y lógica de modificación para devolver un fragmento de JSON actualizado al `editor-app.js` mediante un Callback (`onCambio`).

*Fragmento de delegación y encapsulamiento en un submódulo (`paletas/texto/editor.js`):*
```javascript
picker.addEventListener('input', () => {
    config.colores[i] = picker.value;
    actualizarBarra();
    aplicarGradiente(config, elemento); // Live preview instantáneo
    onCambio('gradiente-texto', config); // Delegar al JSON
});
```
Esto asegura que la lógica de edición de reglas lógicas (`condicion`) y la de diseño (`texto`) nunca se mezclen.

### C. Persistencia y el Servidor Node (`server.js`)
Todo este esfuerzo modular culmina en la persistencia estricta del JSON. Una vez el usuario edita propiedades o lógicas en la UI, el editor lanza una petición POST a `/guardar`.

El backend (`server.js`) es un script Node.js ultra-ligero de un solo archivo que sirve el contenido estático y actúa como intermediario para reescribir el archivo `maestro.json`, cerrando el ciclo.

*Fragmento de persistencia (`server.js`):*
```javascript
if (req.method === 'POST' && req.url === '/guardar') {
    const { archivo, contenido } = JSON.parse(body);
    // Persistencia del plano ciego
    fs.writeFileSync(ruta, JSON.stringify(contenido, null, 4), 'utf-8');
}
```

---

## Conclusión

La modernidad de V4 Framework reside en la absoluta transparencia y modularidad extrema de su flujo de ejecución. Al basarse en una arquitectura de 3 capas inflexibles y un sistema de editores inyectables dinámicamente, el framework destila tanto el proceso de construcción UI como el de diseño (editor) a una simple transferencia de datos JSON a propiedades nativas.

La separación de la lógica condicional, la gestión global de eventos y los cálculos visuales en plugins (paletas) autónomos asegura que V4 se establezca no como una plantilla de diseño estática, sino como un motor autómata verdaderamente revolucionario.
