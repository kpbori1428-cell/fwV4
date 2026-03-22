/**
 * Editor — Función Condición
 * Controles visuales para definir reglas lógicas (if/then) basadas en eventos.
 */

export function construirControles(config, elemento, onCambio) {
    const contenedor = document.createElement('div');

    const titulo = crearTitulo('Reglas Condicionales');
    contenedor.appendChild(titulo);

    // Asegurarse de que config sea un array para soportar múltiples reglas
    let reglas = Array.isArray(config) ? config : [config];

    // Si estaba vacío, inicializar con array vacío
    if (!config || Object.keys(config).length === 0) reglas = [];

    const listaReglas = document.createElement('div');
    listaReglas.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

    const renderizarReglas = () => {
        listaReglas.innerHTML = '';

        reglas.forEach((regla, indice) => {
            const bloque = document.createElement('div');
            bloque.style.cssText = 'padding:8px;background:rgba(217,70,239,0.05);border-radius:6px;border:1px solid rgba(217,70,239,0.2);display:flex;flex-direction:column;gap:6px;';

            // Cabecera con botón de eliminar
            const header = document.createElement('div');
            header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
            const numLabel = document.createElement('span');
            numLabel.textContent = `Condición #${indice + 1}`;
            numLabel.style.cssText = 'font-size:0.65rem;color:#d946ef;font-weight:600;';

            const btnDel = document.createElement('button');
            btnDel.textContent = '×';
            btnDel.style.cssText = 'background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:0.8rem;padding:0;';
            btnDel.addEventListener('click', () => {
                reglas.splice(indice, 1);
                onCambio('condicion', reglas);
                renderizarReglas();
            });

            header.appendChild(numLabel);
            header.appendChild(btnDel);
            bloque.appendChild(header);

            // EVENTO
            const rowEvento = crearRow('Cuándo ocurre:');
            const selectEvento = document.createElement('select');
            selectEvento.style.cssText = estilo.select;
            ['click', 'dblclick', 'mouseenter', 'mouseleave'].forEach(ev => {
                const opt = document.createElement('option');
                opt.value = ev;
                opt.textContent = ev;
                if (regla['evento'] === ev) opt.selected = true;
                selectEvento.appendChild(opt);
            });
            if (!regla['evento']) selectEvento.value = 'click'; // default

            selectEvento.addEventListener('change', () => {
                regla['evento'] = selectEvento.value;
                onCambio('condicion', reglas);
            });
            rowEvento.appendChild(selectEvento);
            bloque.appendChild(rowEvento);

            // CONDICIÓN (SI ESTADO ES)
            const rowSi = crearRow('...Y el estado es:');
            const inputSi = crearInput(regla['si-estado-es'] || '');
            inputSi.placeholder = 'ej. activo';
            inputSi.addEventListener('change', () => {
                regla['si-estado-es'] = inputSi.value;
                onCambio('condicion', reglas);
            });
            rowSi.appendChild(inputSi);
            bloque.appendChild(rowSi);

            const flecha = document.createElement('div');
            flecha.textContent = '↓';
            flecha.style.cssText = 'text-align: center; color: #a855f7; font-size: 1rem; line-height:1; margin: -2px 0;';
            bloque.appendChild(flecha);

            // EFECTO (ENTONCES CAMBIAR A)
            const rowEntonces = crearRow('...Cambiar estado a:');
            const inputEntonces = crearInput(regla['entonces-cambiar-a'] || '');
            inputEntonces.placeholder = 'ej. reposo';
            inputEntonces.addEventListener('change', () => {
                regla['entonces-cambiar-a'] = inputEntonces.value;
                onCambio('condicion', reglas);
            });
            rowEntonces.appendChild(inputEntonces);
            bloque.appendChild(rowEntonces);

            listaReglas.appendChild(bloque);
        });
    };

    renderizarReglas();
    contenedor.appendChild(listaReglas);

    // Botón Agregar Condición
    const btnAgregar = document.createElement('button');
    btnAgregar.textContent = '+ Agregar Condición';
    btnAgregar.style.cssText = 'margin-top:8px;background:rgba(217,70,239,0.1);border:1px dashed rgba(217,70,239,0.4);color:#e879f9;padding:6px 14px;border-radius:6px;font-size:0.7rem;cursor:pointer;width:100%;';
    btnAgregar.addEventListener('click', () => {
        reglas.push({
            "evento": "click",
            "si-estado-es": "",
            "entonces-cambiar-a": ""
        });
        onCambio('condicion', reglas);
        renderizarReglas();
    });

    contenedor.appendChild(btnAgregar);

    return contenedor;
}

// Helpers copiados de la paleta estado (para mantener coherencia visual)
const estilo = {
    input: 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:#e2e8f0;padding:4px 8px;border-radius:4px;font-size:0.72rem;width:110px;text-align:right;',
    select: 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:#e2e8f0;padding:4px 8px;border-radius:4px;font-size:0.72rem;width:128px;'
};

function crearRow(label) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:3px 0;';
    const span = document.createElement('span');
    span.style.cssText = 'font-size:0.65rem;color:#cbd5e1;';
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
    t.style.cssText = 'font-size:0.65rem;color:#475569;text-transform:uppercase;letter-spacing:1px;margin:12px 0 8px;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px;';
    t.textContent = texto;
    return t;
}