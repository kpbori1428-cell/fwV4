import { construirNodo } from './maestro.js';
import { esReservada } from './funcion.js';

(async function v4Engine() {
    // 1. ESTADO: VACÍO (Limpieza total del escenario)
    document.head.innerHTML = '<meta charset="UTF-8">';
    document.body.innerHTML = '';
    document.documentElement.dataset.v4 = "vacio";

    // CARGA DEL PLANO CIEGO (JSON Externo)
    const res = await fetch('./maestro.json');
    const plano = await res.json();

    // 2. ESTADO: DINÁMICO (Generar cuerpo y head variable)
    document.documentElement.dataset.v4 = "dinamico";
    
    // Procesa el Head si existe en el JSON
    if (plano.head) {
        Object.entries(plano.head).forEach(([clave, valor]) => {
            if (clave === 'titulo') document.title = valor;
            if (clave === 'css') {
                document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${valor}">`);
            }
        });
    }

    // Crea el DIV Maestro en el Body para iniciar la secuencia
    const root = document.createElement('div');
    root.id = "v4-main";
    document.body.appendChild(root);

    // 3. BUCLE SECUENCIAL (El Constructor Autómata)
    function recorrer(config, parent, prefijo) {
        for (const clave in config) {
            if (clave === 'head') continue;

            const valor = config[clave];

            // Si es reservada, el maestro ya la procesó — NO crear div
            if (esReservada(clave)) continue;

            if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
                const path = prefijo ? `${prefijo}.${clave}` : clave;

                const div = document.createElement('div');
                div.id = path.replace(/\./g, '-'); 
                div.dataset.path = path;

                construirNodo(valor, div, path);

                parent.appendChild(div);
                recorrer(valor, div, path);
            }
        }
    }

    recorrer(plano, root, '');

    // 4. ESTADO: COMPLETO
    document.documentElement.dataset.v4 = "completo";
    console.log("V4: Estado Completo. El Engine ahora repasa e inyecta/edita valores.");
})();
