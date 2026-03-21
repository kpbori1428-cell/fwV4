/**
 * Editor — Función Estado
 * Controles visuales especiales para definir y modificar estados.
 * Solo se invoca en el entorno del editor.
 */

export function construirControles(config, elemento, onCambio) {
    const contenedor = document.createElement('div');

    // Variable
    const varRow = crearRow('Variable');
    const varInput = crearInput(config.variable || '');
    varInput.addEventListener('change', () => {
        config.variable = varInput.value;
        onCambio('variable', config.variable);
    });
    varRow.appendChild(varInput);
    contenedor.appendChild(varRow);

    // Estado actual (selector)
    const estados = Object.keys(config.reacciones || {});
    const actualRow = crearRow('Estado actual');
    const actualSelect = document.createElement('select');
    actualSelect.style.cssText = estilo.select;
    estados.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e;
        opt.textContent = e;
        if (e === config.actual) opt.selected = true;
        actualSelect.appendChild(opt);
    });
    actualSelect.addEventListener('change', () => {
        config.actual = actualSelect.value;
        onCambio('actual', config.actual);
        // Aplicar visualmente en el preview
        if (elemento && config.reacciones[config.actual]) {
            const props = config.reacciones[config.actual];
            for (const p in props) elemento.style.setProperty(p, props[p]);
        }
    });
    actualRow.appendChild(actualSelect);
    contenedor.appendChild(actualRow);

    // Separador: Acciones
    contenedor.appendChild(crearTitulo('Acciones'));

    const accionesDisponibles = ['click', 'doble-click', 'hover', 'hover-salir'];
    for (const accion of accionesDisponibles) {
        const row = crearRow(accion);
        const select = document.createElement('select');
        select.style.cssText = estilo.select;

        // Opción vacía (sin asignar)
        const optVacio = document.createElement('option');
        optVacio.value = '';
        optVacio.textContent = '—';
        select.appendChild(optVacio);

        estados.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e;
            opt.textContent = e;
            if (config.acciones && config.acciones[accion] === e) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            if (!config.acciones) config.acciones = {};
            if (select.value) {
                config.acciones[accion] = select.value;
            } else {
                delete config.acciones[accion];
            }
            onCambio('acciones', config.acciones);
        });

        row.appendChild(select);
        contenedor.appendChild(row);
    }

    // Separador: Reacciones
    contenedor.appendChild(crearTitulo('Reacciones'));

    for (const nombreEstado in config.reacciones) {
        const bloque = document.createElement('div');
        bloque.style.cssText = 'margin-bottom:12px;padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;border:1px solid rgba(255,255,255,0.05);';

        const header = document.createElement('div');
        header.style.cssText = 'font-size:0.72rem;color:#a78bfa;font-weight:600;margin-bottom:6px;';
        header.textContent = nombreEstado;
        bloque.appendChild(header);

        const props = config.reacciones[nombreEstado];
        for (const prop in props) {
            const row = crearRow(prop);
            let input;

            if (prop === 'color' || prop === 'background' || prop === 'background-color') {
                input = document.createElement('input');
                input.type = 'color';
                input.style.cssText = estilo.color;
                input.value = cssAHex(props[prop]);
            } else {
                input = crearInput(props[prop]);
            }

            input.addEventListener('change', () => {
                props[prop] = input.value;
                onCambio('reacciones', config.reacciones);
                // Aplicar si es el estado actual
                if (nombreEstado === config.actual && elemento) {
                    elemento.style.setProperty(prop, input.value);
                }
            });

            row.appendChild(input);
            bloque.appendChild(row);
        }

        // Botón agregar propiedad
        const btnAgregar = document.createElement('button');
        btnAgregar.textContent = '+ propiedad';
        btnAgregar.style.cssText = 'margin-top:4px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);color:#a78bfa;padding:3px 10px;border-radius:4px;font-size:0.65rem;cursor:pointer;';
        btnAgregar.addEventListener('click', () => {
            const nombre = prompt('Nombre de la propiedad CSS:');
            if (nombre && !(nombre in props)) {
                props[nombre] = '';
                onCambio('reacciones', config.reacciones);
                // Reconstruir los controles
                contenedor.innerHTML = '';
                const nuevos = construirControles(config, elemento, onCambio);
                contenedor.parentNode.replaceChild(nuevos, contenedor);
            }
        });
        bloque.appendChild(btnAgregar);

        contenedor.appendChild(bloque);
    }

    // Botón agregar estado nuevo
    const btnEstado = document.createElement('button');
    btnEstado.textContent = '+ nuevo estado';
    btnEstado.style.cssText = 'margin-top:8px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e;padding:5px 14px;border-radius:6px;font-size:0.7rem;cursor:pointer;width:100%;';
    btnEstado.addEventListener('click', () => {
        const nombre = prompt('Nombre del nuevo estado:');
        if (nombre && !(nombre in config.reacciones)) {
            config.reacciones[nombre] = {};
            onCambio('reacciones', config.reacciones);
            contenedor.innerHTML = '';
            const nuevos = construirControles(config, elemento, onCambio);
            contenedor.parentNode.replaceChild(nuevos, contenedor);
        }
    });
    contenedor.appendChild(btnEstado);

    return contenedor;
}

// Helpers
const estilo = {
    input: 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:#e2e8f0;padding:4px 8px;border-radius:4px;font-size:0.72rem;width:120px;text-align:right;',
    select: 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:#e2e8f0;padding:4px 8px;border-radius:4px;font-size:0.72rem;width:120px;',
    color: 'width:28px;height:28px;border:1px solid rgba(255,255,255,0.1);border-radius:4px;cursor:pointer;padding:0;background:transparent;',
};

function crearRow(label) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:3px 0;';
    const span = document.createElement('span');
    span.style.cssText = 'font-size:0.72rem;color:#64748b;';
    span.textContent = label;
    row.appendChild(span);
    return row;
}

function crearInput(valor) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = valor;
    input.style.cssText = estilo.input;
    return input;
}

function crearTitulo(texto) {
    const t = document.createElement('div');
    t.style.cssText = 'font-size:0.65rem;color:#475569;text-transform:uppercase;letter-spacing:1px;margin:12px 0 6px;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px;';
    t.textContent = texto;
    return t;
}

function cssAHex(val) {
    if (typeof val === 'string' && val.startsWith('#')) return val.length <= 7 ? val : val.slice(0, 7);
    return '#ffffff';
}
