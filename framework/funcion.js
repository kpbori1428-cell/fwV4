/**
 * JS Función
 * Registro y despacho de claves reservadas.
 * Cada función vive en su propio archivo dentro de funciones/
 * Cada paleta vive en su propio directorio dentro de paletas/
 */

const reservadas = {};
const paletas = {};

export function registrar(clave, handler) {
    reservadas[clave] = handler;
}

export function registrarPaleta(nombre, moduloVisual) {
    paletas[nombre] = moduloVisual;
    reservadas[nombre] = async (valor, elemento, path) => {
        await moduloVisual.construir(valor, elemento, path);
    };
}

export function ejecutar(clave, valor, elemento, path) {
    if (reservadas[clave]) {
        reservadas[clave](valor, elemento, path);
        return true;
    }
    return false;
}

export function esReservada(clave) {
    return clave in reservadas;
}

// Cargar funciones
import { inicializar as initEstado } from './funciones/estado/estado.js';
initEstado(registrar);

// Cargar paletas
const textoVisual = await import('./paletas/texto/visual.js');
registrarPaleta('texto', textoVisual);

const tarjetaVisual = await import('./paletas/tarjeta/visual.js');
registrarPaleta('tarjeta', tarjetaVisual);
