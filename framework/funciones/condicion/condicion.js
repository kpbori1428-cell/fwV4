/**
 * Función: condicion
 * Puente lógico que evalúa el estado actual de un elemento (del módulo estado.js)
 * y ejecuta cambios de estado basados en eventos del DOM.
 * Permite encadenar lógica sin modificar los módulos base.
 */
import { getEstado, setEstado } from '../estado/estado.js';

export function inicializar(registrar) {
    registrar('condicion', (config, elemento, path) => {
        // La configuración debe ser un array de reglas o un solo objeto regla
        const reglas = Array.isArray(config) ? config : [config];
        const idElemento = path || elemento.id;

        // Las reglas pueden ser locales (basadas en eventos del DOM) o globales (reactivas a estados)
        const eventosAgrupados = {};
        const reglasGlobales = [];

        reglas.forEach(regla => {
            const evento = regla['evento'];
            const siEstadoEs = regla['si-estado-es'];
            const entoncesCambiarA = regla['entonces-cambiar-a'];

            // Regla global reactiva (sin evento, basada en observar otros estados)
            const observar = regla['observar']; // Array de IDs
            const todosSon = regla['si-todos-son']; // Estado que deben tener todos
            const algunoEs = regla['si-alguno-es']; // Estado que debe tener al menos uno

            if (observar && (todosSon || algunoEs) && entoncesCambiarA) {
                reglasGlobales.push({ observar, todosSon, algunoEs, entoncesCambiarA });
                return;
            }

            // Regla local basada en evento del DOM
            if (!evento || !siEstadoEs || !entoncesCambiarA) return;

            if (!eventosAgrupados[evento]) {
                eventosAgrupados[evento] = [];
            }
            eventosAgrupados[evento].push({ siEstadoEs, entoncesCambiarA });

            if (evento === 'click') {
                elemento.style.cursor = 'pointer';
            }
        });

        // 1. Registrar listeners para eventos locales (DOM)
        for (const [evento, reglasEvento] of Object.entries(eventosAgrupados)) {
            elemento.addEventListener(evento, () => {
                const estadoActual = getEstado(idElemento);

                // Buscar la primera regla que coincida y aplicarla
                for (const regla of reglasEvento) {
                    if (estadoActual === regla.siEstadoEs) {
                        setEstado(idElemento, regla.entoncesCambiarA);
                        break;
                    }
                }
            });
        }

        // 2. Registrar listener global para reglas reactivas
        if (reglasGlobales.length > 0) {
            document.addEventListener('v4-estado-cambiado', () => {
                for (const regla of reglasGlobales) {
                    let cumpleCondicion = false;

                    if (regla.todosSon) {
                        // Verifica si TODOS los elementos observados tienen el estado requerido
                        cumpleCondicion = regla.observar.every(idObs => getEstado(idObs) === regla.todosSon);
                    } else if (regla.algunoEs) {
                        // Verifica si AL MENOS UNO de los elementos observados tiene el estado requerido
                        cumpleCondicion = regla.observar.some(idObs => getEstado(idObs) === regla.algunoEs);
                    }

                    if (cumpleCondicion) {
                        // Evitar bucles infinitos: solo cambiar si el estado es diferente
                        if (getEstado(idElemento) !== regla.entoncesCambiarA) {
                            setEstado(idElemento, regla.entoncesCambiarA);
                        }
                        // Opcional: break aquí si solo queremos que se aplique la primera regla global que coincida
                        break;
                    }
                }
            });
        }
    });
}
