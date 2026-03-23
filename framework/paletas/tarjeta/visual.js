/**
 * Visual — Paleta Tarjeta
 * Sabe leer los JSON para construir un elemento de tipo tarjeta.
 * Si falta alguna propiedad base, agrega el default faltante.
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

    // Aplicar las propiedades que sí vienen en el JSON maestro
    for (const clave in config) {
        const valor = config[clave];

        // Solo propiedades simples (string/número), no objetos
        if (typeof valor !== 'object' || valor === null) {
            elemento.style.setProperty(clave, valor);
        }
    }

    // PLUS: Efecto Cristal (Backdrop Filter blur)
    if (config['efecto-cristal']) {
        const cristal = config['efecto-cristal'];
        const desenfoque = cristal.desenfoque || 10;
        elemento.style.backdropFilter = `blur(${desenfoque}px)`;
        elemento.style.WebkitBackdropFilter = `blur(${desenfoque}px)`;

        // El fondo translúcido y el borde suelen ir con el cristal
        if (cristal.fondo) elemento.style.background = cristal.fondo;
        if (cristal.borde) elemento.style.border = cristal.borde;
    } else {
        // Limpiar si el efecto fue removido
        elemento.style.backdropFilter = '';
        elemento.style.WebkitBackdropFilter = '';
    }

    // PLUS: Efecto Neón (Sombra Glow)
    if (config['efecto-neon']) {
        const neon = config['efecto-neon'];
        const color = neon.color || '#a855f7';
        const intensidad = neon.intensidad || 15; // px de sombra
        const inset = neon.inset ? `inset 0 0 ${intensidad}px ${color}, ` : '';
        elemento.style.boxShadow = `${inset}0 0 ${intensidad}px ${color}`;
        elemento.style.border = `1px solid ${color}`;
    }
}
