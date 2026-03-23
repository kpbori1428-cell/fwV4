import re

with open('framework/editor-app.js', 'r') as f:
    content = f.read()

# Add a button in the inspector before the modules selector
button_html = """
    // Boton de "Guardar Estado Actual"
    const btnGuardarEstado = document.createElement('button');
    btnGuardarEstado.textContent = '💾 Guardar estado actual';
    btnGuardarEstado.style.cssText = 'margin-top: 24px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; width: 100%; transition: all 0.2s;';
    btnGuardarEstado.addEventListener('mouseenter', () => btnGuardarEstado.style.background = 'rgba(16, 185, 129, 0.2)');
    btnGuardarEstado.addEventListener('mouseleave', () => btnGuardarEstado.style.background = 'rgba(16, 185, 129, 0.1)');

    btnGuardarEstado.addEventListener('click', () => {
        if (!datos.estado) {
            datos.estado = {
                variable: 'personalizado',
                actual: 'personalizado',
                acciones: {},
                reacciones: {}
            };
        }

        const nombreEstado = datos.estado.actual || 'personalizado';
        if (!datos.estado.reacciones) datos.estado.reacciones = {};

        const propiedadesActuales = {};

        // Copiar props nativas
        for (const clave in datos) {
            if (typeof datos[clave] !== 'object') {
                propiedadesActuales[clave] = datos[clave];
            } else if (clave !== 'estado' && clave !== 'condicion' && clave !== 'hijos') {
                // Copiar configuraciones de paletas (ej. gradiente-texto, texto)
                propiedadesActuales[clave] = JSON.parse(JSON.stringify(datos[clave]));
            }
        }

        datos.estado.reacciones[nombreEstado] = propiedadesActuales;

        btnGuardarEstado.textContent = '✓ Guardado como "' + nombreEstado + '"';
        setTimeout(() => btnGuardarEstado.textContent = '💾 Guardar estado actual', 2000);

        guardarJSON(jsonMaestro);
        mostrarInspector(datos, path);
    });

    propsNativas.appendChild(btnGuardarEstado);

    if (!tienePlus) {
"""

content = content.replace("    if (!tienePlus) {", button_html)

with open('framework/editor-app.js', 'w') as f:
    f.write(content)

print("editor patched")
