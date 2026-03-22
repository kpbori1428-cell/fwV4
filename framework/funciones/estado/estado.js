/**
 * Función: estado
 * Manejo reactivo de estados por elemento.
 * El usuario define la variable, las acciones que cambian el estado,
 * y las reacciones (propiedades CSS) de cada estado.
 */

const estados = {};

export function inicializar(registrar) {
    registrar('estado', (config, elemento, path) => {
        const { variable, actual, acciones, reacciones } = config;

        // Guardar estado actual
        const id = path || elemento.id;
        estados[id] = { variable, actual, acciones, reacciones, elemento };

        // Aplicar estado inicial
        aplicarEstado(id, actual);

        // Registrar acciones
        if (acciones) {
            if (acciones.click) {
                elemento.style.cursor = 'pointer';
                elemento.addEventListener('click', () => cambiarEstado(id, acciones.click));
            }
            if (acciones['doble-click']) {
                elemento.addEventListener('dblclick', () => cambiarEstado(id, acciones['doble-click']));
            }
            if (acciones.hover) {
                elemento.addEventListener('mouseenter', () => cambiarEstado(id, acciones.hover));
            }
            if (acciones['hover-salir']) {
                elemento.addEventListener('mouseleave', () => cambiarEstado(id, acciones['hover-salir']));
            }
        }
    });
}

function aplicarEstado(id, nuevoEstado) {
    const estado = estados[id];
    if (!estado || !estado.reacciones[nuevoEstado]) return;

    estado.actual = nuevoEstado;
    const propiedades = estado.reacciones[nuevoEstado];

    // Limpiar propiedades de todos los estados
    for (const nombreEstado in estado.reacciones) {
        for (const prop in estado.reacciones[nombreEstado]) {
            if (prop !== 'texto') {
                estado.elemento.style.removeProperty(prop);
            }
        }
    }

    // Aplicar propiedades del nuevo estado
    for (const prop in propiedades) {
        if (prop === 'texto') {
            // Intentar encontrar el texto generado por la paleta 'texto'
            // O modificar textContent si no hay (usar textContent es más seguro que innerText en inicialización)

            // Usamos setTimeout para permitir que el motor termine de agregar hijos en el mismo tick
            setTimeout(() => {
                // Selecciona cualquier nodo hijo que sea un div de texto dentro de este elemento
                const textNode = Array.from(estado.elemento.querySelectorAll('div')).find(div => div.dataset.path && div.dataset.path.endsWith('.texto'));
                if (textNode) {
                    textNode.textContent = propiedades[prop];
                } else {
                    // Si no existe un div de paleta texto, creamos uno de texto puro o lo actualizamos
                    const textDirect = Array.from(estado.elemento.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                    if (textDirect) {
                        textDirect.nodeValue = propiedades[prop];
                    } else {
                        estado.elemento.appendChild(document.createTextNode(propiedades[prop]));
                    }
                }
            }, 50);

        } else {
            estado.elemento.style.setProperty(prop, propiedades[prop]);
        }
    }

    estado.elemento.dataset.estado = nuevoEstado;

    // Disparar evento global para que otras funciones (ej. condicion) reaccionen
    document.dispatchEvent(new CustomEvent('v4-estado-cambiado', {
        detail: { id, estado: nuevoEstado }
    }));
}

function cambiarEstado(id, nuevoEstado) {
    aplicarEstado(id, nuevoEstado);
}

export function setEstado(pathOrId, nuevoEstado) {
    aplicarEstado(pathOrId, nuevoEstado);
}

export function getEstado(pathOrId) {
    return estados[pathOrId]?.actual || null;
}
