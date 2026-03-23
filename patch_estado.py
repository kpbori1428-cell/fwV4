with open('framework/funciones/estado/estado.js', 'r') as f:
    content = f.read()

# Import the 'ejecutar' function from the central registrar
import_stmt = "import { ejecutar } from '../../funcion.js';\n\nconst estados = {};"
content = content.replace("const estados = {};", import_stmt)

# Update 'aplicarEstado' logic
search = """    // Aplicar propiedades del nuevo estado
    for (const prop in propiedades) {
        if (prop === 'texto') {
            estado.elemento.dataset.estadoTextoEsperado = propiedades[prop];
            // Actualizar el DOM si la paleta de texto ya existe o si solo hay texto plano
            const textNode = Array.from(estado.elemento.querySelectorAll('div')).find(div => div.dataset.path && div.dataset.path.endsWith('.texto'));
            if (textNode) {
                textNode.innerHTML = propiedades[prop];
            } else {
                const textDirect = Array.from(estado.elemento.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textDirect) {
                    textDirect.nodeValue = propiedades[prop];
                } else if (estado.elemento.childNodes.length === 0) {
                    estado.elemento.innerHTML = propiedades[prop];
                }
            }
        } else {
            estado.elemento.style.setProperty(prop, propiedades[prop]);
        }
    }"""

replace = """    // Aplicar propiedades del nuevo estado
    for (const prop in propiedades) {
        if (typeof propiedades[prop] === 'object' && propiedades[prop] !== null) {
            // Es una paleta o función avanzada (ej. gradiente-texto, texto)
            ejecutar(prop, propiedades[prop], estado.elemento, id + '.' + prop);
        } else if (prop === 'texto') {
            estado.elemento.dataset.estadoTextoEsperado = propiedades[prop];
            // Actualizar el DOM si la paleta de texto ya existe o si solo hay texto plano
            const textNode = Array.from(estado.elemento.querySelectorAll('div')).find(div => div.dataset.path && div.dataset.path.endsWith('.texto'));
            if (textNode) {
                textNode.innerHTML = propiedades[prop];
            } else {
                const textDirect = Array.from(estado.elemento.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textDirect) {
                    textDirect.nodeValue = propiedades[prop];
                } else if (estado.elemento.childNodes.length === 0) {
                    estado.elemento.innerHTML = propiedades[prop];
                }
            }
        } else {
            estado.elemento.style.setProperty(prop, propiedades[prop]);
        }
    }"""

content = content.replace(search, replace)

with open('framework/funciones/estado/estado.js', 'w') as f:
    f.write(content)

print("estado patched")
