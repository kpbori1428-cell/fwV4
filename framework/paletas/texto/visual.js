/**
 * Visual — Paleta Texto
 * Sabe leer los JSON para construir un elemento de texto.
 * Si falta alguna propiedad base, agrega el default faltante.
 * Las propiedades opcionales solo se agregan si vienen en el JSON maestro.
 */

let baseDefaults = null;

async function cargarBase() {
    if (!baseDefaults) {
        const res = await fetch('./paletas/texto/base.json');
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

    // Texto es inline — ajustar al contenido, no al padre
    if (!config.width) {
        elemento.style.width = 'fit-content';
    }

    // Aplicar las propiedades que sí vienen en el JSON maestro
    for (const clave in config) {
        const valor = config[clave];

        // Solo propiedades simples (string/número), no objetos
        if (typeof valor !== 'object' || valor === null) {
            elemento.style.setProperty(clave, valor);
        }
    }

    // Contenido de texto (respetar si un estado ya lo sobreescribió en init)
    // El dataset se establece en el mismo elemento (ya que "estado" y "texto" son hermanos en el JSON y aplican al mismo nodo)
    if (elemento.dataset && elemento.dataset.estadoTextoEsperado) {
        elemento.innerHTML = elemento.dataset.estadoTextoEsperado;
    } else if (config.contenido) {
        elemento.innerHTML = config.contenido;
    }

    // PLUS: gradiente de texto
    if (config['gradiente-texto']) {
        const g = config['gradiente-texto'];
        const stops = g.colores.map((c, i) => `${c} ${g.posiciones[i]}%`).join(', ');
        elemento.style.backgroundImage = `linear-gradient(${g.direccion}, ${stops})`;
        elemento.style.webkitBackgroundClip = 'text';
        elemento.style.backgroundClip = 'text';
        elemento.style.color = 'transparent';
    }
}
