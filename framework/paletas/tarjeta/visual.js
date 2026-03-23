/**
 * Visual — Paleta Tarjeta
 * Sabe leer los JSON para construir un elemento de tarjeta.
 * Si falta alguna propiedad base indispensable, agrega el default faltante.
 * Las propiedades opcionales solo se agregan si vienen en el JSON maestro.
 */

let baseDefaults = null;

async function cargarBase() {
    if (!baseDefaults) {
        const res = await fetch('./paletas/tarjeta/base.json');
        baseDefaults = await res.json();
    }
    return baseDefaults;
}

export async function construir(config, elemento, path) {
    const base = await cargarBase();

    // Verificar propiedades base — si falta alguna, agregar el default
    for (const clave in base) {
        if (!(clave in config)) {
            elemento.style.setProperty(clave, base[clave]);
        }
    }

    // Aplicar las propiedades que sí vienen explícitamente en el JSON maestro
    for (const clave in config) {
        const valor = config[clave];

        // Solo propiedades simples (string/número), no objetos (que serían funciones PLUS)
        if (typeof valor !== 'object' || valor === null) {
            elemento.style.setProperty(clave, valor);
        }
    }
}
