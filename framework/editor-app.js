/**
 * Editor App
 * Lógica del entorno editor.
 * - Carga el JSON maestro
 * - Construye el árbol de nodos
 * - Maneja selección de elementos en el iframe
 * - Muestra propiedades nativas en el inspector (automático)
 * - Si hay clave reservada de paleta, invoca editor.js de la paleta
 */

let jsonMaestro = null;
let nodoSeleccionado = null;
let pathSeleccionado = null;

const panelArbol = document.getElementById('panel-arbol');
const propsNativas = document.getElementById('props-nativas');
const propsPlus = document.getElementById('props-plus');
const sinSeleccion = document.getElementById('sin-seleccion');
const preview = document.getElementById('preview');

// Cargar JSON maestro
async function cargarJSON() {
    const res = await fetch('./maestro.json');
    jsonMaestro = await res.json();
    construirArbol(jsonMaestro, '', 0);
}

// Construir panel del árbol
function construirArbol(config, prefijo, nivel) {
    for (const clave in config) {
        if (clave === 'head') continue;
        const valor = config[clave];

        if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
            const path = prefijo ? `${prefijo}.${clave}` : clave;
            const nodo = document.createElement('div');
            nodo.className = 'nodo-arbol';
            nodo.textContent = clave;
            nodo.dataset.path = path;
            nodo.style.paddingLeft = `${12 + nivel * 16}px`;

            nodo.addEventListener('click', () => seleccionar(path, nodo));
            panelArbol.appendChild(nodo);

            construirArbol(valor, path, nivel + 1);
        }
    }
}

// Seleccionar un nodo
function seleccionar(path, nodoDOM) {
    // Desmarcar anterior
    document.querySelectorAll('.nodo-arbol.activo').forEach(n => n.classList.remove('activo'));
    nodoDOM.classList.add('activo');

    pathSeleccionado = path;

    // Buscar los datos en el JSON maestro
    const datos = obtenerPorPath(jsonMaestro, path);
    if (!datos) return;

    // Resaltar en el iframe
    resaltarEnPreview(path);

    // Mostrar inspector
    mostrarInspector(datos, path);
}

// Obtener un nodo del JSON por su path
function obtenerPorPath(obj, path) {
    const claves = path.split('.');
    let actual = obj;
    for (const c of claves) {
        if (actual && typeof actual === 'object' && c in actual) {
            actual = actual[c];
        } else {
            return null;
        }
    }
    return actual;
}

// Resaltar elemento en el iframe
function resaltarEnPreview(path) {
    try {
        const doc = preview.contentDocument || preview.contentWindow.document;
        // Limpiar resaltados anteriores
        doc.querySelectorAll('[data-path]').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
        });
        // Resaltar el seleccionado
        const el = doc.querySelector(`[data-path="${path}"]`);
        if (el) {
            el.style.outline = '2px solid #a78bfa';
            el.style.outlineOffset = '2px';
        }
    } catch (e) {
        // iframe no accesible
    }
}

// Mostrar inspector con propiedades nativas + plus
async function mostrarInspector(datos, path) {
    sinSeleccion.style.display = 'none';
    propsNativas.style.display = 'block';
    propsNativas.innerHTML = '<h3>Propiedades Nativas</h3>';

    let tienePlus = false;

    for (const clave in datos) {
        const valor = datos[clave];

        // Si es objeto, puede ser paleta, función, o contenedor
        if (typeof valor === 'object' && valor !== null) {
            // Intentar cargar editor de paleta
            let editorMod = null;
            try {
                editorMod = await import(`./paletas/${clave}/editor.js`);
            } catch (e) {}

            // Intentar cargar editor de función
            if (!editorMod) {
                try {
                    editorMod = await import(`./funciones/${clave}/editor.js`);
                } catch (e) {}
            }

            if (editorMod) {
                tienePlus = true;

                // Mostrar las propiedades nativas dentro del objeto
                for (const subClave in valor) {
                    const subValor = valor[subClave];
                    if (typeof subValor === 'object') continue;
                    agregarControlNativo(subClave, subValor, valor, propsNativas);
                }

                // Mostrar controles especiales
                mostrarPlusControles(clave, editorMod, datos, path);
            }
            continue;
        }

        // Propiedad nativa → crear control automático
        agregarControlNativo(clave, valor, datos, propsNativas);
    }

    if (!tienePlus) {
        propsPlus.style.display = 'none';
    }
}

// Crear control automático para una propiedad nativa
function agregarControlNativo(clave, valor, jsonRef, contenedor) {
    const row = document.createElement('div');
    row.className = 'prop-row';

    const label = document.createElement('span');
    label.className = 'prop-label';
    label.textContent = clave;

    let input;
    if (clave === 'color' || clave === 'background' || clave === 'background-color' || clave === 'border-color') {
        input = document.createElement('input');
        input.type = 'color';
        input.className = 'prop-color';
        input.value = valorAHex(valor);
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'prop-input';
        input.value = valor;
    }

    input.addEventListener('change', () => {
        jsonRef[clave] = input.value;
        actualizarPreview();
    });

    row.appendChild(label);
    row.appendChild(input);
    contenedor.appendChild(row);
}


// Mostrar controles plus de una paleta
async function mostrarPlusControles(nombrePaleta, editorMod, datos, path) {
    propsPlus.style.display = 'block';
    propsPlus.innerHTML = `<h3>Plus — ${nombrePaleta}</h3>`;

    const datosPlus = datos[nombrePaleta] || {};

    // Obtener el elemento del iframe para aplicar cambios en vivo
    let elementoPreview = null;
    try {
        const doc = preview.contentDocument || preview.contentWindow.document;
        elementoPreview = doc.querySelector(`[data-path="${path}"]`);
    } catch (e) {}

    // El editor.js de la paleta construye los controles reales
    const controles = editorMod.construirControles(datosPlus, elementoPreview, (propiedad, valor) => {
        // Callback: actualizar JSON cuando el usuario modifica un control
        datos[nombrePaleta][propiedad] = valor;
    });

    propsPlus.appendChild(controles);
}

// Actualizar preview recargando el iframe
function actualizarPreview() {
    preview.contentWindow.location.reload();
}

// Convertir color CSS a hex (simple)
function valorAHex(val) {
    if (val.startsWith('#')) return val.length <= 7 ? val : val.slice(0, 7);
    return '#ffffff';
}

// Click en el iframe para seleccionar
preview.addEventListener('load', () => {
    try {
        const doc = preview.contentDocument || preview.contentWindow.document;
        doc.addEventListener('click', (e) => {
            const target = e.target.closest('[data-path]');
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                const path = target.dataset.path;
                // Buscar el nodo del árbol correspondiente
                const nodoArbol = panelArbol.querySelector(`[data-path="${path}"]`);
                if (nodoArbol) {
                    seleccionar(path, nodoArbol);
                }
            }
        }, true);
    } catch (e) {
        // iframe no accesible
    }
});

// Guardar
document.getElementById('btn-guardar').addEventListener('click', async () => {
    try {
        const res = await fetch('/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archivo: 'maestro.json', contenido: jsonMaestro })
        });
        const data = await res.json();
        if (data.ok) {
            console.log('Guardado correctamente');
            // Recargar preview para reflejar cambios guardados
            preview.contentWindow.location.reload();
        }
    } catch (e) {
        console.error('Error al guardar:', e);
    }
});

// Exportar
document.getElementById('btn-exportar').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(jsonMaestro, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maestro.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Iniciar
cargarJSON();
