/**
 * Función: condicion
 * Puente lógico que evalúa el estado actual de un elemento (del módulo estado.js)
 * y ejecuta cambios de estado basados en eventos del DOM.
 * Permite encadenar lógica sin modificar los módulos base.
 */
import { getEstado, setEstado } from '../estado/estado.js';

export function inicializar(registrar) {
    registrar('condicion', (config, elemento, path) => {
        const reglas = Array.isArray(config) ? config : [config];
        const idElemento = path || elemento.id;

        const reglasEventosLocales = {}; // Agrupado por tipo de evento ('click', 'mouseenter', etc)
        const reglasReactivas = [];      // Reglas que se disparan automáticamente (sin evento de usuario)

        reglas.forEach(regla => {
            const evento = regla['evento'];

            // Si tiene evento es local, sino es reactiva global.
            if (evento && evento !== 'automatico') {
                if (!reglasEventosLocales[evento]) {
                    reglasEventosLocales[evento] = [];
                }
                reglasEventosLocales[evento].push(regla);

                if (evento === 'click') {
                    elemento.style.cursor = 'pointer';
                }
            } else {
                reglasReactivas.push(regla);
            }
        });

        // Función centralizada para evaluar si una regla compleja se cumple
        const evaluarRegla = (regla) => {
            // 1. Validar el estado del propio elemento (si lo pide)
            const miEstadoReq = regla['si-estado-es'];
            if (miEstadoReq && getEstado(idElemento) !== miEstadoReq) {
                return false;
            }

            // 2. Validar los estados externos (diccionario "observar")
            const observar = regla['observar']; // Ej: { "switch1": "encendido", "boton2": "activo" }
            if (observar && typeof observar === 'object' && !Array.isArray(observar)) {
                const llaves = Object.keys(observar);
                if (llaves.length > 0) {
                    const logica = regla['logica'] || 'todos'; // 'todos' o 'alguno'

                    if (logica === 'todos') {
                        // Todos los elementos observados deben tener el estado esperado
                        const todosCumplen = llaves.every(idObs => getEstado(idObs) === observar[idObs]);
                        if (!todosCumplen) return false;
                    } else if (logica === 'alguno') {
                        // Al menos uno debe tener el estado esperado
                        const algunoCumple = llaves.some(idObs => getEstado(idObs) === observar[idObs]);
                        if (!algunoCumple) return false;
                    }
                }
            } else if (Array.isArray(observar)) {
                // Retrocompatibilidad con la sintaxis antigua basada en Array + "si-todos-son"/"si-alguno-es"
                if (regla['si-todos-son']) {
                    const cumple = observar.every(idObs => getEstado(idObs) === regla['si-todos-son']);
                    if (!cumple) return false;
                } else if (regla['si-alguno-es']) {
                    const cumple = observar.some(idObs => getEstado(idObs) === regla['si-alguno-es']);
                    if (!cumple) return false;
                }
            }

            // Si pasó todas las validaciones que existían en la regla, es true.
            return true;
        };

        const aplicarEfecto = (regla) => {
            const entonces = regla['entonces-cambiar-a'];
            if (entonces && getEstado(idElemento) !== entonces) {
                setEstado(idElemento, entonces);
            }
        };

        // 1. Escuchar Eventos Locales (Interacciones DOM)
        for (const [evento, listaReglas] of Object.entries(reglasEventosLocales)) {
            elemento.addEventListener(evento, () => {
                for (const regla of listaReglas) {
                    if (evaluarRegla(regla)) {
                        aplicarEfecto(regla);
                        break; // Solo aplicar la primera regla que coincida por evento
                    }
                }
            });
        }

        // 2. Escuchar Eventos Globales (Reactividad Automática)
        if (reglasReactivas.length > 0) {
            document.addEventListener('v4-estado-cambiado', () => {
                for (const regla of reglasReactivas) {
                    if (evaluarRegla(regla)) {
                        aplicarEfecto(regla);
                        break;
                    }
                }
            });
        }
    });
}
