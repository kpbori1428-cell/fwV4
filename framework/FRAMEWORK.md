# V4 Framework

## Filosofía

Tres capas con roles absolutos:

- **JSON** (El Plano Ciego) — Contiene la data y las piezas. No tiene conciencia de su utilidad ni de cómo se ejecutan. Solo *es*.
- **JS** (El Constructor Autómata) — Sabe ensamblar las piezas basándose en las indicaciones del JSON. No entiende el propósito del sitio ni el contenido. Solo *arma*.
- **HTML** (El Escenario Mudo) — Solo muestra el resultado final del ensamblaje. No tiene memoria del proceso ni sabe de dónde vinieron las instrucciones. Solo *exhibe*.

### Principio de rendimiento

Todo el intercambio es texto puro (JSON). El motor no *piensa*, solo mapea texto a propiedades nativas del DOM. Los nodos se reutilizan y sobreescriben — nunca se crean y destruyen objetos constantemente. El resultado es una experiencia compleja con un consumo de hardware mínimo.

---

## Arquitectura

### Engine

El engine es el framework. Un solo bucle (`construir`) recorre el JSON y por cada clave genera el inicio de un ciclo. El ciclo se define solo según vaya avanzando

#### Ciclo

```
JS engine arma el div con la información que va recibiendo de cada JS, lee secuencialmente el contenedor maestro JSON y asigna a cada div un nombre por nivel como un diagrama de arbol
entonces define por cada uno un nombre asignado
ejemplo: 
{ "contenedor": { "cont1": { "subcont1": { "subsubcont1": {} } }, "cont2": { "subcont2": { "subsubcont2": {} } } } }
sería: 
contenedor
contenedor.cont1
contenedor.cont1.subcont1
contenedor.cont1.subcont1.subsubcont1
contenedor.cont2
contenedor.cont2.subcont2
contenedor.cont2.subcont2.subsubcont2
por cada nombre asignado JS engine invoca a JS maestro, al invocarse desde JS engine, JS maestro a construir lo que se define en el JSON maestro, si JS maestro encuentra una clave reservada, invoca a JS funcion, este al recibir la información desde JS maestro, reacciona, verifica la clave, acciona la funcion la clave
JS funcion sabe qué hacer con cada clave reservada.
```

#### Claves reservadas

Las claves reservadas se definen a medida que se construyen funciones del framework. Cada función nueva agrega una clave nueva al vocabulario.


---

### Sistema de Paletas

Las paletas son prediseños — no definen el comportamiento del framework, pero contienen información especial para las funciones.

3 paletas iniciales: **texto**, **boton**, **tarjeta**.

Directorio principal `paletas/`, con subdirectorios por cada paleta:

```
paletas/
├── texto/
│   ├── base.json
│   ├── plus.json
│   ├── visual.js
│   └── editor.js
├── boton/
│   ├── base.json
│   ├── plus.json
│   ├── visual.js
│   └── editor.js
└── tarjeta/
    ├── base.json
    ├── plus.json
    ├── visual.js
    └── editor.js
```

Cada subdirectorio contiene:

- **base.json** — propiedades por default de la paleta
- **plus.json** — propiedades especiales opcionales de la paleta
- **visual.js** — quien sabe leer los JSON para construirlo
- **editor.js** — quien entrega las herramientas para modificar el JSON

---

JS Funcion, si lo invocan con una clave reservada de paleta, retransmite la información a JS visual, este recibe el JSON de la paleta que está en el JSON maestro, revisa qué contiene la paleta para poder construirla.

JS visual, si detecta que falta alguna propiedad base, le agrega el default base faltante.

Todas las demás propiedades son opcionales, si no vienen en el JSON maestro, no se agregan.

---

El editor sabe modificar las propiedades que son nativas (CSS directo). Si existe una clave reservada, invoca al editor.js dedicado de esa paleta para que le entregue las herramientas especiales de control.

---



