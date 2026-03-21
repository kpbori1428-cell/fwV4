/**
 * Editor — Paleta Texto
 * Controles visuales especiales para las propiedades PLUS de esta paleta.
 * Los parámetros nativos (CSS) los asigna el editor general automáticamente.
 * Solo se invoca en el entorno del editor.
 */

export function construirControles(datosPlus, elemento, onCambio) {
    const contenedor = document.createElement('div');

    // GRADIENTE DE TEXTO
    if (datosPlus['gradiente-texto'] || true) {
        const config = datosPlus['gradiente-texto'] || {
            colores: ['#a855f7', '#ec4899', '#3b82f6'],
            posiciones: [0, 50, 100],
            direccion: '135deg'
        };

        const bloque = document.createElement('div');
        bloque.style.cssText = 'margin-bottom:16px;';

        // Título
        const titulo = document.createElement('div');
        titulo.textContent = 'Gradiente de Texto';
        titulo.style.cssText = 'font-size:0.72rem;color:#7c3aed;margin-bottom:8px;font-weight:600;';
        bloque.appendChild(titulo);

        // Barra de preview del gradiente
        const barra = document.createElement('div');
        barra.style.cssText = `
            width:100%;height:24px;border-radius:6px;margin-bottom:10px;
            border:1px solid rgba(255,255,255,0.08);cursor:pointer;
        `;
        function actualizarBarra() {
            const stops = config.colores.map((c, i) => `${c} ${config.posiciones[i]}%`).join(', ');
            barra.style.background = `linear-gradient(90deg, ${stops})`;
        }
        actualizarBarra();
        bloque.appendChild(barra);

        // Color pickers
        const pickersRow = document.createElement('div');
        pickersRow.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;';

        config.colores.forEach((color, i) => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;';

            const picker = document.createElement('input');
            picker.type = 'color';
            picker.value = color;
            picker.style.cssText = 'width:100%;height:28px;border:1px solid rgba(255,255,255,0.1);border-radius:4px;cursor:pointer;padding:0;background:transparent;';

            picker.addEventListener('input', () => {
                config.colores[i] = picker.value;
                actualizarBarra();
                aplicarGradiente(config, elemento);
                onCambio('gradiente-texto', config);
            });

            const posInput = document.createElement('input');
            posInput.type = 'range';
            posInput.min = '0';
            posInput.max = '100';
            posInput.value = config.posiciones[i];
            posInput.style.cssText = 'width:100%;height:4px;cursor:pointer;accent-color:#7c3aed;';

            posInput.addEventListener('input', () => {
                config.posiciones[i] = parseInt(posInput.value);
                actualizarBarra();
                aplicarGradiente(config, elemento);
                onCambio('gradiente-texto', config);
            });

            wrapper.appendChild(picker);
            wrapper.appendChild(posInput);
            pickersRow.appendChild(wrapper);
        });
        bloque.appendChild(pickersRow);

        // Dirección
        const dirRow = document.createElement('div');
        dirRow.style.cssText = 'display:flex;align-items:center;gap:8px;';

        const dirLabel = document.createElement('span');
        dirLabel.textContent = 'Dirección';
        dirLabel.style.cssText = 'font-size:0.7rem;color:#64748b;';

        const dirInput = document.createElement('input');
        dirInput.type = 'range';
        dirInput.min = '0';
        dirInput.max = '360';
        dirInput.value = parseInt(config.direccion) || 135;
        dirInput.style.cssText = 'flex:1;height:4px;cursor:pointer;accent-color:#7c3aed;';

        const dirValor = document.createElement('span');
        dirValor.textContent = `${dirInput.value}°`;
        dirValor.style.cssText = 'font-size:0.7rem;color:#94a3b8;width:35px;text-align:right;';

        dirInput.addEventListener('input', () => {
            config.direccion = `${dirInput.value}deg`;
            dirValor.textContent = `${dirInput.value}°`;
            actualizarBarra();
            aplicarGradiente(config, elemento);
            onCambio('gradiente-texto', config);
        });

        dirRow.appendChild(dirLabel);
        dirRow.appendChild(dirInput);
        dirRow.appendChild(dirValor);
        bloque.appendChild(dirRow);

        contenedor.appendChild(bloque);
    }

    return contenedor;
}

function aplicarGradiente(config, elemento) {
    const stops = config.colores.map((c, i) => `${c} ${config.posiciones[i]}%`).join(', ');
    elemento.style.backgroundImage = `linear-gradient(${config.direccion}, ${stops})`;
    elemento.style.webkitBackgroundClip = 'text';
    elemento.style.backgroundClip = 'text';
    elemento.style.color = 'transparent';
}
