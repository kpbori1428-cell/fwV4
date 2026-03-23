/**
 * Editor — Paleta Tarjeta
 * Controles visuales especiales para las propiedades PLUS de esta paleta.
 * Los parámetros nativos (CSS) los asigna el editor general automáticamente.
 * Solo se invoca en el entorno del editor.
 */

export function construirControles(datosPlus, elemento, onCambio) {
    const contenedor = document.createElement('div');

    // PLUS: EFECTO CRISTAL (Glassmorphism)
    if (datosPlus['efecto-cristal'] || true) {
        const configCristal = datosPlus['efecto-cristal'] || {
            desenfoque: 10,
            fondo: 'rgba(255, 255, 255, 0.05)',
            borde: '1px solid rgba(255, 255, 255, 0.1)'
        };

        const bloque = document.createElement('div');
        bloque.style.cssText = 'margin-bottom:16px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 12px;';

        const titulo = document.createElement('div');
        titulo.textContent = 'Efecto Cristal';
        titulo.style.cssText = 'font-size:0.72rem;color:#7c3aed;margin-bottom:8px;font-weight:600;';
        bloque.appendChild(titulo);

        // Nivel de Desenfoque
        const rowBlur = crearRow('Nivel de Desenfoque');
        const inputBlur = document.createElement('input');
        inputBlur.type = 'range';
        inputBlur.min = '0';
        inputBlur.max = '50';
        inputBlur.value = configCristal.desenfoque || 10;
        inputBlur.style.cssText = 'width:80px;height:4px;cursor:pointer;accent-color:#7c3aed;';

        const valorBlur = document.createElement('span');
        valorBlur.textContent = `${inputBlur.value}px`;
        valorBlur.style.cssText = 'font-size:0.7rem;color:#94a3b8;width:35px;text-align:right;';

        inputBlur.addEventListener('input', () => {
            configCristal.desenfoque = parseInt(inputBlur.value);
            valorBlur.textContent = `${inputBlur.value}px`;
            aplicarCristal(configCristal, elemento);
            onCambio('efecto-cristal', configCristal);
        });

        const divBlurControles = document.createElement('div');
        divBlurControles.style.cssText = 'display:flex;align-items:center;gap:8px;';
        divBlurControles.appendChild(inputBlur);
        divBlurControles.appendChild(valorBlur);
        rowBlur.appendChild(divBlurControles);
        bloque.appendChild(rowBlur);

        contenedor.appendChild(bloque);
    }

    // PLUS: EFECTO NEÓN (Glow)
    if (datosPlus['efecto-neon'] || true) {
        const configNeon = datosPlus['efecto-neon'] || {
            color: '#a855f7',
            intensidad: 15,
            inset: false
        };

        const bloque = document.createElement('div');
        bloque.style.cssText = 'margin-bottom:8px;';

        const titulo = document.createElement('div');
        titulo.textContent = 'Efecto Neón (Glow)';
        titulo.style.cssText = 'font-size:0.72rem;color:#7c3aed;margin-bottom:8px;font-weight:600;';
        bloque.appendChild(titulo);

        // Color
        const rowColor = crearRow('Color Resplandor');
        const inputColor = document.createElement('input');
        inputColor.type = 'color';
        inputColor.value = configNeon.color || '#a855f7';
        inputColor.style.cssText = 'width:28px;height:28px;border:1px solid rgba(255,255,255,0.1);border-radius:4px;cursor:pointer;padding:0;background:transparent;';
        inputColor.addEventListener('input', () => {
            configNeon.color = inputColor.value;
            aplicarNeon(configNeon, elemento);
            onCambio('efecto-neon', configNeon);
        });
        rowColor.appendChild(inputColor);
        bloque.appendChild(rowColor);

        // Intensidad
        const rowIntensidad = crearRow('Intensidad (Radio)');
        const inputIntensidad = document.createElement('input');
        inputIntensidad.type = 'range';
        inputIntensidad.min = '0';
        inputIntensidad.max = '100';
        inputIntensidad.value = configNeon.intensidad || 15;
        inputIntensidad.style.cssText = 'width:80px;height:4px;cursor:pointer;accent-color:#7c3aed;';

        const valorIntensidad = document.createElement('span');
        valorIntensidad.textContent = `${inputIntensidad.value}px`;
        valorIntensidad.style.cssText = 'font-size:0.7rem;color:#94a3b8;width:35px;text-align:right;';

        inputIntensidad.addEventListener('input', () => {
            configNeon.intensidad = parseInt(inputIntensidad.value);
            valorIntensidad.textContent = `${inputIntensidad.value}px`;
            aplicarNeon(configNeon, elemento);
            onCambio('efecto-neon', configNeon);
        });

        const divIntControles = document.createElement('div');
        divIntControles.style.cssText = 'display:flex;align-items:center;gap:8px;';
        divIntControles.appendChild(inputIntensidad);
        divIntControles.appendChild(valorIntensidad);
        rowIntensidad.appendChild(divIntControles);
        bloque.appendChild(rowIntensidad);

        contenedor.appendChild(bloque);
    }

    return contenedor;
}

function crearRow(labelTexto) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
    const label = document.createElement('span');
    label.textContent = labelTexto;
    label.style.cssText = 'font-size:0.7rem;color:#64748b;';
    row.appendChild(label);
    return row;
}

// Helpers para aplicar los estilos en vivo en el DOM
function aplicarCristal(config, elemento) {
    const desenfoque = config.desenfoque || 10;
    elemento.style.backdropFilter = `blur(${desenfoque}px)`;
    elemento.style.WebkitBackdropFilter = `blur(${desenfoque}px)`;
    if (config.fondo) elemento.style.background = config.fondo;
    if (config.borde) elemento.style.border = config.borde;
}

function aplicarNeon(config, elemento) {
    const color = config.color || '#a855f7';
    const intensidad = config.intensidad || 15;
    const inset = config.inset ? `inset 0 0 ${intensidad}px ${color}, ` : '';
    elemento.style.boxShadow = `${inset}0 0 ${intensidad}px ${color}`;
    elemento.style.border = `1px solid ${color}`;
}
