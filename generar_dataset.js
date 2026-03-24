const fs = require('fs');

// Cargar contexto del framework
const documentacion = fs.readFileSync('DOCUMENTACION_V4_CORTA.md', 'utf8');

// Ejemplos generados a mano para DPO (Direct Preference Optimization / RLHF)
// Formato estricto según documentación oficial de Vertex AI para Gemini (Preference Tuning)
const ejemplos = [
    {
        user: "Crea un botón simple con fondo azul y texto blanco.",
        v4: "{\"boton\": {\"background\": \"blue\", \"color\": \"white\", \"padding\": \"10px\", \"texto\": {\"contenido\": \"Haz clic\"}}}",
        malo: "<button style='background: blue; color: white; padding: 10px;'>Haz clic</button>"
    },
    {
        user: "Necesito un contenedor flex que centre todo su contenido.",
        v4: "{\"contenedor\": {\"display\": \"flex\", \"justify-content\": \"center\", \"align-items\": \"center\"}}",
        malo: "<div class='flex justify-center items-center'></div>"
    },
    {
        user: "Cómo defino un estado 'activo' para un switch que cambie a verde cuando le haga click?",
        v4: "{\"switch\": {\"estado\": {\"variable\": \"modo\", \"actual\": \"apagado\", \"acciones\": {\"click\": \"activo\"}, \"reacciones\": {\"activo\": {\"background\": \"green\"}}}}}",
        malo: "const [activo, setActivo] = useState(false); return <div onClick={() => setActivo(true)} style={{background: activo ? 'green' : 'gray'}}>Switch</div>;"
    },
    {
        user: "Usa la paleta de texto para crear un título grande con un gradiente de texto de rojo a azul.",
        v4: "{\"titulo\": {\"texto\": {\"contenido\": \"Mi Título\", \"font-size\": \"2rem\", \"gradiente-texto\": {\"colores\": [\"red\", \"blue\"], \"posiciones\": [0, 100], \"direccion\": \"90deg\"}}}}",
        malo: "<h1 style='background: linear-gradient(90deg, red, blue); -webkit-background-clip: text; color: transparent;'>Mi Título</h1>"
    },
    {
        user: "Crea un componente de puerta que se abra si el switch1 y switch2 están en modo 'encendido'.",
        v4: "{\"puerta\": {\"estado\": {\"variable\": \"acceso\", \"actual\": \"cerrado\", \"reacciones\": {\"abierto\": {\"background\": \"blue\"}}}, \"condicion\": [{\"observar\": {\"switch1\": \"encendido\", \"switch2\": \"encendido\"}, \"logica\": \"todos\", \"entonces-cambiar-a\": \"abierto\"}]}}",
        malo: "useEffect(() => { if (switch1 === 'encendido' && switch2 === 'encendido') setPuertaAbierta(true); }, [switch1, switch2]);"
    },
    {
        user: "Dame un contenedor oscuro que tenga efecto hover para escalar.",
        v4: "{\"caja-hover\": {\"background\": \"#1e293b\", \"transition\": \"all 0.3s ease\", \"estado\": {\"variable\": \"hover-modo\", \"actual\": \"reposo\", \"acciones\": {\"hover\": \"encendido\", \"hover-salir\": \"reposo\"}, \"reacciones\": {\"encendido\": {\"transform\": \"scale(1.05)\", \"background\": \"#334155\"}}}}}",
        malo: "<div className='bg-slate-800 hover:bg-slate-700 hover:scale-105 transition-all'></div>"
    },
    {
        user: "Inserta un texto simple que diga 'Hola Mundo' con tipografía sans-serif.",
        v4: "{\"saludo\": {\"font-family\": \"sans-serif\", \"texto\": {\"contenido\": \"Hola Mundo\"}}}",
        malo: "<p style='font-family: sans-serif;'>Hola Mundo</p>"
    },
    {
        user: "Haz que un componente reaccione a un doble click y cambie su color de borde a rojo.",
        v4: "{\"caja\": {\"border\": \"1px solid black\", \"estado\": {\"variable\": \"borde-estado\", \"actual\": \"normal\", \"acciones\": {\"doble-click\": \"alerta\"}, \"reacciones\": {\"alerta\": {\"border-color\": \"red\"}}}}}",
        malo: "<div onDoubleClick={() => setBorderColor('red')} style={{borderColor: borderColor}}>Caja</div>"
    },
    {
        user: "Quiero una caja principal que ocupe todo el ancho y alto de la pantalla.",
        v4: "{\"pantalla\": {\"width\": \"100vw\", \"height\": \"100vh\", \"background\": \"black\"}}",
        malo: "<div style='width: 100vw; height: 100vh; background: black'></div>"
    },
    {
        user: "Si mi estado interno es 'reposo' y hago click, quiero que pase a 'activo'. Usa el módulo condición local.",
        v4: "{\"boton\": {\"estado\": {\"variable\": \"modo\", \"actual\": \"reposo\", \"reacciones\": {\"activo\": {\"background\": \"blue\"}}}, \"condicion\": [{\"evento\": \"click\", \"si-estado-es\": \"reposo\", \"entonces-cambiar-a\": \"activo\"}]}}",
        malo: "<button onClick={() => estado === 'reposo' ? setEstado('activo') : null}>Botón</button>"
    }
];

// Para entrenar a Gemini mejor, vamos a multiplicar la base de ejemplos
// mezclando combinaciones lógicas del framework V4.
// Generaremos 50 ejemplos para tener una buena validación/entrenamiento inicial.
let datasetFinal = [];

for (let i = 0; i < 5; i++) {
    ejemplos.forEach(ej => {
        // En cada iteración variamos ligeramente los nombres para enriquecer el dataset
        const nombreAleatorio = `elemento_${Math.floor(Math.random() * 1000)}`;
        const modV4 = ej.v4.replace(Object.keys(JSON.parse(ej.v4))[0], nombreAleatorio);

        const linea = {
            system_instruction: {
                parts: [{ text: `Eres el Arquitecto de Software Experto del V4 Framework.\nREGLAS ESTRICTAS:\n1. Cero Virtual DOM: Manipulación directa (elemento.style.setProperty).\n2. Arquitectura de 3 Capas: JSON (Plano Ciego), JS (Constructor), HTML (Escenario Mudo).\n3. Reactividad Nativa: Usa 'v4-estado-cambiado' (estado.js y condicion.js).\n4. Paletas Funcionales (PLUS): Funciones matemáticas complejas (ej. gradiente-texto).\n5. Prohibido HTML crudo, React o CSS classes.\n\nCONOCIMIENTO BASE:\n${documentacion.substring(0, 1000)}...` }]
            },
            contents: [
                { role: "user", parts: [{ text: ej.user }] }
            ],
            completions: [
                {
                    score: 1, // La respuesta perfecta de V4
                    completion: { role: "model", parts: [{ text: modV4 }] }
                },
                {
                    score: 0, // El instinto natural que queremos castigar
                    completion: { role: "model", parts: [{ text: ej.malo }] }
                }
            ]
        };
        datasetFinal.push(linea);
    });
}

// Barajar el array aleatoriamente
datasetFinal = datasetFinal.sort(() => Math.random() - 0.5);

// Dividir en 80% entrenamiento, 20% validación (o min 10 ejemplos para GCP)
const validacionCount = Math.max(10, Math.floor(datasetFinal.length * 0.2));
const datasetValidacion = datasetFinal.slice(0, validacionCount);
const datasetEntrenamiento = datasetFinal.slice(validacionCount);

// Función para guardar en formato JSONL (una línea por objeto JSON)
function saveToJSONL(dataArray, filename) {
    const stream = fs.createWriteStream(filename, { flags: 'w' });
    dataArray.forEach(item => {
        stream.write(JSON.stringify(item) + '\n');
    });
    stream.end();
    console.log(`Guardado ${filename} con ${dataArray.length} líneas.`);
}

saveToJSONL(datasetEntrenamiento, 'dataset_entrenamiento.jsonl');
saveToJSONL(datasetValidacion, 'dataset_validacion.jsonl');
