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

            // TIPO DE REGLA
            const esGlobal = regla.observar !== undefined;

            const rowTipo = crearRow('Tipo de regla:');
            const selectTipo = document.createElement('select');
            selectTipo.style.cssText = estilo.select;

            const optLocal = document.createElement('option');
            optLocal.value = 'local';
            optLocal.textContent = 'Evento Local';
            if (!esGlobal) optLocal.selected = true;

            const optGlobal = document.createElement('option');
            optGlobal.value = 'global';
            optGlobal.textContent = 'Estado Global (Reactivo)';
            if (esGlobal) optGlobal.selected = true;

            selectTipo.appendChild(optLocal);
            selectTipo.appendChild(optGlobal);

            selectTipo.addEventListener('change', () => {
                if (selectTipo.value === 'global') {
                    delete regla.evento;
                    delete regla['si-estado-es'];
                    regla.observar = [];
                    regla['si-todos-son'] = '';
                } else {
                    delete regla.observar;
                    delete regla['si-todos-son'];
                    delete regla['si-alguno-es'];
                    regla.evento = 'click';
                    regla['si-estado-es'] = '';
                }
                onCambio('condicion', reglas);
                renderizarReglas();
            });
            rowTipo.appendChild(selectTipo);
            bloque.appendChild(rowTipo);

            if (!esGlobal) {
                // EVENTO LOCAL
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
            } else {
                // ESTADO GLOBAL REACTIVO
                const rowObservar = crearRow('Observar elementos:');
                bloque.appendChild(rowObservar);

                // Buscar elementos disponibles en el iframe
                let pathsDisponibles = [];
                if (elemento && elemento.ownerDocument) {
                    pathsDisponibles = Array.from(elemento.ownerDocument.querySelectorAll('[data-path]')).map(el => el.dataset.path);
                }

                const divObservar = document.createElement('div');
                divObservar.style.cssText = 'max-height: 80px; overflow-y: auto; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; padding: 4px; display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;';

                let observadosActuales = Array.isArray(regla.observar) ? regla.observar : [];

                if (pathsDisponibles.length === 0) {
                    divObservar.innerHTML = '<span style="font-size:0.6rem;color:#64748b;">No se encontraron elementos (abre un elemento en el canvas)</span>';
                } else {
                    pathsDisponibles.forEach(p => {
                        const lbl = document.createElement('label');
                        lbl.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 0.65rem; color: #cbd5e1; cursor: pointer;';

                        const chk = document.createElement('input');
                        chk.type = 'checkbox';
                        chk.checked = observadosActuales.includes(p);

                        chk.addEventListener('change', () => {
                            if (chk.checked) {
                                if (!observadosActuales.includes(p)) observadosActuales.push(p);
                            } else {
                                observadosActuales = observadosActuales.filter(x => x !== p);
                            }
                            regla.observar = observadosActuales;
                            onCambio('condicion', reglas);
                        });

                        lbl.appendChild(chk);
                        lbl.appendChild(document.createTextNode(p));
                        divObservar.appendChild(lbl);
                    });
                }
                bloque.appendChild(divObservar);

                // REGLA LÓGICA
                const rowLogica = crearRow('Condición lógica:');
                const selectLogica = document.createElement('select');
                selectLogica.style.cssText = estilo.select;

                const usaTodos = regla['si-todos-son'] !== undefined;

                const optTodos = document.createElement('option');
                optTodos.value = 'todos';
                optTodos.textContent = 'Si TODOS son...';
                if (usaTodos) optTodos.selected = true;

                const optAlguno = document.createElement('option');
                optAlguno.value = 'alguno';
                optAlguno.textContent = 'Si ALGUNO es...';
                if (!usaTodos) optAlguno.selected = true;

                selectLogica.appendChild(optTodos);
                selectLogica.appendChild(optAlguno);

                selectLogica.addEventListener('change', () => {
                    const valorActual = regla['si-todos-son'] || regla['si-alguno-es'] || '';
                    if (selectLogica.value === 'todos') {
                        delete regla['si-alguno-es'];
                        regla['si-todos-son'] = valorActual;
                    } else {
                        delete regla['si-todos-son'];
                        regla['si-alguno-es'] = valorActual;
                    }
                    onCambio('condicion', reglas);
                    renderizarReglas();
                });
                rowLogica.appendChild(selectLogica);
                bloque.appendChild(rowLogica);

                // ESTADO ESPERADO
                const rowEstado = crearRow('Estado esperado:');
                const valEstado = regla['si-todos-son'] || regla['si-alguno-es'] || '';
                const inputEstado = crearInput(valEstado);
                inputEstado.placeholder = 'ej. encendido';
                inputEstado.addEventListener('change', () => {
                    if (selectLogica.value === 'todos') {
                        regla['si-todos-son'] = inputEstado.value;
                    } else {
                        regla['si-alguno-es'] = inputEstado.value;
                    }
                    onCambio('condicion', reglas);
                });
                rowEstado.appendChild(inputEstado);
                bloque.appendChild(rowEstado);
            }

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