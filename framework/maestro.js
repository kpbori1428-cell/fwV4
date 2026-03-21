/**
 * JS Maestro
 * Rol: Ensamblador Autómata.
 * Acción: Viste el div creado por el Engine.
 */
import { esReservada, ejecutar } from './funcion.js';

export function construirNodo(config, elemento, path) {
    for (const clave in config) {
        const valor = config[clave];

        // 1. FILTRO DE FUNCIONES (Objetos, Arrays o Valores Simples)
        // Si la clave es reservada, JS Maestro se detiene e invoca a JS Función.
        if (esReservada(clave)) {
            ejecutar(clave, valor, elemento, path);
            continue; // Terminó su trabajo con esta clave
        }

        // 2. FILTRO DE ESTRUCTURA (Contenedores Ciegos)
        // Si es un objeto y NO es reservada, es una rama del árbol.
        // El Maestro lo ignora (continue) para que el Engine lo procese después.
        if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
            continue; 
        }

        // 3. FILTRO DE PROPIEDADES NATIVAS (CSS Directo)
        // Si llegó aquí, no es función ni estructura; es estilo puro.
        // El motor no piensa, solo mapea el texto del JSON al estilo del DOM.
        elemento.style.setProperty(clave, valor);
    }
}
