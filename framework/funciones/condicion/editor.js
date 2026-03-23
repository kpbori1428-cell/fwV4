/**
 * Editor — Función Condición (Motor Avanzado Híbrido)
 * Controles visuales para definir reglas lógicas complejas.
 */

export function construirControles(config, elemento, onCambio) {
    const contenedor = document.createElement('div');
    const titulo = crearTitulo('Reglas Condicionales');
    contenedor.appendChild(titulo);

    let reglas = Array.isArray(config) ? config : [config];
    if (!config || Object.keys(config).length === 0) reglas = [];

    const listaReglas = document.createElement('div');
    listaReglas.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

    const renderizarReglas = () => {
        listaReglas.innerHTML = '';

        reglas.forEach((regla, indice) => {
            const bloque = document.createElement('div');
            bloque.style.cssText = 'padding:8px;background:rgba(217,70,239,0.05);border-radius:6px;border:1px solid rgba(217,70,239,0.2);display:flex;flex-direction:column;gap:6px;';

            // Cabecera
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

            // 1. DISPARADOR (Cuándo se evalúa la regla)
            const rowEvento = crearRow('Cuándo evaluar:');
            const selectEvento = document.createElement('select');
            selectEvento.style.cssText = estilo.select;

            // Opciones de disparo
            const opcionesEvento = ['automatico', 'click', 'dblclick', 'mouseenter', 'mouseleave'];
            opcionesEvento.forEach(ev => {
                const opt = document.createElement('option');
                opt.value = ev;
                opt.textContent = ev === 'automatico' ? 'Automático (Reactivo)' : `Evento: ${ev}`;
                if (regla['evento'] === ev || (!regla['evento'] && ev === 'automatico')) {
                    opt.selected = true;
                }
                selectEvento.appendChild(opt);
            });

            selectEvento.addEventListener('change', () => {
                if (selectEvento.value === 'automatico') {
                    delete regla['evento'];
                } else {
                    regla['evento'] = selectEvento.value;
                }
                onCambio('condicion', reglas);
            });
            rowEvento.appendChild(selectEvento);
            bloque.appendChild(rowEvento);

            // 2. CONDICIÓN PROPIA (Opcional)
            const rowSi = crearRow('Si MI estado es:');
            const inputSi = crearInput(regla['si-estado-es'] || '');
            inputSi.placeholder = '(cualquiera)';
            inputSi.addEventListener('change', () => {
                if (inputSi.value.trim() === '') {
                    delete regla['si-estado-es'];
                } else {
                    regla['si-estado-es'] = inputSi.value.trim();
                }
                onCambio('condicion', reglas);
            });
            rowSi.appendChild(inputSi);
            bloque.appendChild(rowSi);

            // 3. OBSERVAR ESTADOS EXTERNOS
            // Convertir formato antiguo (array + si-todos-son) a formato nuevo (diccionario + logica) si es necesario para la UI
            let obsObj = regla['observar'];
            if (Array.isArray(obsObj)) {
                // Migrar a obj
                const nuevoObj = {};
                const estadoMigrado = regla['si-todos-son'] || regla['si-alguno-es'] || '';
                obsObj.forEach(id => { nuevoObj[id] = estadoMigrado; });
                regla['observar'] = nuevoObj;
                if (regla['si-todos-son']) { regla['logica'] = 'todos'; delete regla['si-todos-son']; }
                if (regla['si-alguno-es']) { regla['logica'] = 'alguno'; delete regla['si-alguno-es']; }
                obsObj = nuevoObj;
            }
            if (!obsObj) obsObj = {};

            const separadorObs = document.createElement('div');
            separadorObs.style.cssText = 'border-top:1px dashed rgba(217,70,239,0.2); margin: 4px 0; padding-top:4px; font-size: 0.65rem; color: #d946ef;';
            separadorObs.textContent = 'Y OTROS elementos cumplen:';
            bloque.appendChild(separadorObs);

            const divObservados = document.createElement('div');
            divObservados.style.cssText = 'display:flex; flex-direction:column; gap:4px;';

            const llavesObs = Object.keys(obsObj);
            llavesObs.forEach(idObs => {
                const rowObs = document.createElement('div');
                rowObs.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 4px; font-size: 0.65rem; color: #cbd5e1;';

                const spanId = document.createElement('span');
                spanId.textContent = idObs;
                spanId.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;'
                spanId.title = idObs;

                const inputVal = document.createElement('input');
                inputVal.type = 'text';
                inputVal.value = obsObj[idObs];
                inputVal.style.cssText = estilo.input + 'width: 60px; padding: 2px 4px;';
                inputVal.addEventListener('change', () => {
                    obsObj[idObs] = inputVal.value;
                    onCambio('condicion', reglas);
                });

                const btnRemoveObs = document.createElement('button');
                btnRemoveObs.textContent = '×';
                btnRemoveObs.style.cssText = 'background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:0.7rem;padding:0 4px;';
                btnRemoveObs.addEventListener('click', () => {
                    delete obsObj[idObs];
                    if (Object.keys(obsObj).length === 0) delete regla['observar'];
                    onCambio('condicion', reglas);
                    renderizarReglas();
                });

                const divControls = document.createElement('div');
                divControls.style.cssText = 'display:flex; align-items:center; gap:4px;';
                divControls.appendChild(inputVal);
                divControls.appendChild(btnRemoveObs);

                rowObs.appendChild(spanId);
                rowObs.appendChild(divControls);
                divObservados.appendChild(rowObs);
            });
            bloque.appendChild(divObservados);

            // Botón añadir elemento a observar
            const btnAddObs = document.createElement('button');
            btnAddObs.textContent = '+ Añadir elemento a observar';
            btnAddObs.style.cssText = 'background:rgba(217,70,239,0.1); border:1px solid rgba(217,70,239,0.3); color:#e879f9; padding:4px; border-radius:4px; font-size:0.6rem; cursor:pointer; width:100%;';
            btnAddObs.addEventListener('click', () => {
                // Listar elementos disponibles en el iframe
                let pathsDisponibles = [];
                if (elemento && elemento.ownerDocument) {
                    pathsDisponibles = Array.from(elemento.ownerDocument.querySelectorAll('[data-path]')).map(el => el.dataset.path);
                }

                const menu = document.createElement('select');
                menu.style.cssText = estilo.select + 'width:100%; margin-top:4px;';
                menu.innerHTML = '<option value="">Selecciona un elemento...</option>';
                pathsDisponibles.forEach(p => {
                    if (!obsObj[p]) {
                        const opt = document.createElement('option');
                        opt.value = p;
                        opt.textContent = p;
                        menu.appendChild(opt);
                    }
                });

                menu.addEventListener('change', () => {
                    if (menu.value) {
                        if (!regla.observar) regla.observar = {};
                        regla.observar[menu.value] = 'activo'; // default
                        onCambio('condicion', reglas);
                        renderizarReglas();
                    }
                });

                btnAddObs.parentNode.replaceChild(menu, btnAddObs);
            });
            bloque.appendChild(btnAddObs);

            // 4. LÓGICA DE OBSERVADOS (Solo si hay más de 1)
            if (Object.keys(obsObj).length > 1) {
                const rowLogica = crearRow('Exigir que se cumplan:');
                const selectLogica = document.createElement('select');
                selectLogica.style.cssText = estilo.select;

                ['todos', 'alguno'].forEach(lg => {
                    const opt = document.createElement('option');
                    opt.value = lg;
                    opt.textContent = lg.toUpperCase();
                    if ((regla['logica'] || 'todos') === lg) opt.selected = true;
                    selectLogica.appendChild(opt);
                });

                selectLogica.addEventListener('change', () => {
                    regla['logica'] = selectLogica.value;
                    onCambio('condicion', reglas);
                });
                rowLogica.appendChild(selectLogica);
                bloque.appendChild(rowLogica);
            }

            const flecha = document.createElement('div');
            flecha.textContent = '↓';
            flecha.style.cssText = 'text-align: center; color: #a855f7; font-size: 1rem; line-height:1; margin: -2px 0;';
            bloque.appendChild(flecha);

            // 5. EFECTO (ENTONCES CAMBIAR A)
            const rowEntonces = crearRow('Entonces cambiar a:');
            const inputEntonces = crearInput(regla['entonces-cambiar-a'] || '');
            inputEntonces.placeholder = 'ej. activo';
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
    btnAgregar.textContent = '+ Agregar Regla';
    btnAgregar.style.cssText = 'margin-top:8px;background:rgba(217,70,239,0.1);border:1px dashed rgba(217,70,239,0.4);color:#e879f9;padding:6px 14px;border-radius:6px;font-size:0.7rem;cursor:pointer;width:100%;';
    btnAgregar.addEventListener('click', () => {
        reglas.push({
            "entonces-cambiar-a": ""
        });
        onCambio('condicion', reglas);
        renderizarReglas();
    });

    contenedor.appendChild(btnAgregar);

    return contenedor;
}

// Helpers
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
