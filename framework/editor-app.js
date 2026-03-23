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
    propsPlus.innerHTML = '';

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

            // Intentar cargar editor de función (ej: estado, condicion)
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


    // Boton de "Guardar Estado Actual"
    const btnGuardarEstado = document.createElement('button');
    btnGuardarEstado.textContent = '💾 Guardar estado actual';
    btnGuardarEstado.style.cssText = 'margin-top: 24px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; width: 100%; transition: all 0.2s;';
    btnGuardarEstado.addEventListener('mouseenter', () => btnGuardarEstado.style.background = 'rgba(16, 185, 129, 0.2)');
    btnGuardarEstado.addEventListener('mouseleave', () => btnGuardarEstado.style.background = 'rgba(16, 185, 129, 0.1)');

    btnGuardarEstado.addEventListener('click', () => {
        if (!datos.estado) {
            datos.estado = {
                variable: 'personalizado',
                actual: 'personalizado',
                acciones: {},
                reacciones: {}
            };
        }

        const nombreEstado = datos.estado.actual || 'personalizado';
        if (!datos.estado.reacciones) datos.estado.reacciones = {};

        const propiedadesActuales = {};

        // Copiar props nativas
        for (const clave in datos) {
            if (typeof datos[clave] !== 'object') {
                propiedadesActuales[clave] = datos[clave];
            } else if (clave !== 'estado' && clave !== 'condicion' && clave !== 'hijos') {
                // Copiar configuraciones de paletas (ej. gradiente-texto, texto)
                propiedadesActuales[clave] = JSON.parse(JSON.stringify(datos[clave]));
            }
        }

        datos.estado.reacciones[nombreEstado] = propiedadesActuales;

        btnGuardarEstado.textContent = '✓ Guardado como "' + nombreEstado + '"';
        setTimeout(() => btnGuardarEstado.textContent = '💾 Guardar estado actual', 2000);

        guardarJSON(jsonMaestro);
        mostrarInspector(datos, path);
    });

    propsNativas.appendChild(btnGuardarEstado);

    if (!tienePlus) {

        propsPlus.style.display = 'none';
    }

    // Agregar sección para inyectar nuevos módulos (paletas/funciones)
    agregarSelectorDeModulos(datos, path);
}

// Selector para añadir módulos que el elemento aún no tiene
function agregarSelectorDeModulos(datos, path) {
    const contenedorAdd = document.createElement('div');
    contenedorAdd.style.cssText = 'margin-top: 24px; padding-top: 16px; border-top: 1px dashed rgba(255,255,255,0.1);';

    const titulo = document.createElement('h3');
    titulo.textContent = 'Añadir Funcionalidad';
    titulo.style.cssText = 'font-size: 0.7rem; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;';
    contenedorAdd.appendChild(titulo);

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display: flex; gap: 8px;';

    const select = document.createElement('select');
    select.style.cssText = 'flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; padding: 6px 8px; border-radius: 4px; font-size: 0.75rem;';

    // Lista de módulos core disponibles
    const modulosDisponibles = ['estado', 'condicion', 'texto'];

    // Filtrar los que ya tiene el elemento
    const modulosParaAgregar = modulosDisponibles.filter(m => !(m in datos));

    if (modulosParaAgregar.length === 0) {
        select.disabled = true;
        const opt = document.createElement('option');
        opt.textContent = 'Todos los módulos añadidos';
        select.appendChild(opt);
    } else {
        const optVacia = document.createElement('option');
        optVacia.value = '';
        optVacia.textContent = 'Seleccionar módulo...';
        select.appendChild(optVacia);

        modulosParaAgregar.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m.charAt(0).toUpperCase() + m.slice(1);
            select.appendChild(opt);
        });
    }

    const btnAdd = document.createElement('button');
    btnAdd.textContent = 'Añadir';
    btnAdd.style.cssText = 'background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; padding: 6px 12px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s;';
    btnAdd.disabled = modulosParaAgregar.length === 0;

    btnAdd.addEventListener('click', () => {
        const modulo = select.value;
        if (!modulo) return;

        // Inyectar estructura inicial básica según el módulo
        if (modulo === 'estado') {
            datos['estado'] = { variable: 'nuevo', actual: 'estado1', reacciones: { estado1: {} } };
        } else if (modulo === 'condicion') {
            datos['condicion'] = [];
        } else if (modulo === 'texto') {
            datos['texto'] = { contenido: 'Nuevo texto' };
        }

        // Forzar re-renderizado del inspector (y cargar el editor.js correspondiente)
        mostrarInspector(datos, path);
    });

    wrap.appendChild(select);
    wrap.appendChild(btnAdd);
    contenedorAdd.appendChild(wrap);

    // Lo añadimos al final de propsPlus (asegurándonos de que propsPlus sea visible)
    propsPlus.style.display = 'block';
    propsPlus.appendChild(contenedorAdd);
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

    const contenedorPlus = document.createElement('div');
    contenedorPlus.style.cssText = 'margin-bottom: 12px; border: 1px solid rgba(139,92,246,0.3); border-radius: 6px; overflow: hidden;';

    // Header del acordeón
    const header = document.createElement('div');
    header.style.cssText = 'background: rgba(139,92,246,0.15); padding: 8px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #d8b4fe; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;';

    const titulo = document.createElement('span');
    titulo.textContent = `Plus — ${nombrePaleta}`;
    header.appendChild(titulo);

    const iconoCaret = document.createElement('span');
    // Si la paleta es la de texto o estado por default las cerramos, y abrimos la de condicion si existe. O por simplicidad, todas abiertas.
    iconoCaret.textContent = '▼';
    iconoCaret.style.cssText = 'transition: transform 0.2s; font-size: 0.7rem;';
    header.appendChild(iconoCaret);

    contenedorPlus.appendChild(header);

    // Contenido del acordeón
    const contenido = document.createElement('div');
    contenido.style.cssText = 'padding: 12px; background: rgba(0,0,0,0.2);';

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
        if (Array.isArray(datos[nombrePaleta]) && propiedad === nombrePaleta) {
            datos[nombrePaleta] = valor;
        } else {
            datos[nombrePaleta][propiedad] = valor;
        }
    });

    contenido.appendChild(controles);
    contenedorPlus.appendChild(contenido);

    // Lógica colapsable
    let abierto = true;
    header.addEventListener('click', () => {
        abierto = !abierto;
        contenido.style.display = abierto ? 'block' : 'none';
        iconoCaret.style.transform = abierto ? 'rotate(0deg)' : 'rotate(-90deg)';
    });

    propsPlus.appendChild(contenedorPlus);
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
