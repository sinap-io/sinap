# SINAP — Guía del proyecto en lenguaje claro

> Este documento está escrito para Sebastián. No asume conocimientos de programación.
> Explica qué es cada parte del sistema, por qué existe, y cómo se conecta todo.
>
> Última actualización: 26 marzo 2026

---

## Qué es SINAP

SINAP es una plataforma web que funciona como el sistema nervioso del ecosistema biotech de Córdoba. Su trabajo es conectar actores que se necesitan entre sí pero que no saben que el otro existe.

**El problema concreto que resuelve:** Un laboratorio de la UNC ofrece análisis de cromatografía que una startup farmacéutica necesita urgentemente. Pero la startup no sabe que el laboratorio existe, y el laboratorio no sabe que hay demanda. SINAP hace visible esa conexión.

**Las tres funciones principales:**
1. **Mapa del ecosistema** — Quiénes son, qué ofrecen, qué necesitan
2. **Detección de gaps** — Qué servicios se demandan pero no se ofrecen (o viceversa)
3. **Vinculación** — Gestionar el proceso de conectar actores hasta que la colaboración ocurre

---

## Las partes del sistema

### El prototipo (app/)

Es la versión inicial, construida rápido para validar la idea con stakeholders del clúster. Fue desarrollada en Streamlit (una herramienta de Python que permite hacer interfaces simples). Está conectada a una base de datos propia (`sinap-prototype`).

**Estado:** Funciona y se usa para mostrarla. **No se toca** — es la referencia mientras construimos la versión productiva.

---

### La base de datos (Neon.tech)

Es donde vive toda la información: actores, servicios, necesidades, instrumentos de financiamiento, casos de vinculación.

Usamos **Neon.tech**, un servicio de base de datos PostgreSQL en la nube. PostgreSQL es el motor de base de datos más usado en el mundo para aplicaciones profesionales.

Tenemos dos bases separadas:

| Base | Para qué | Estado |
|---|---|---|
| `sinap-prototype` | El prototipo Streamlit | Funciona, no tocar |
| `sinap-production` | La versión productiva | Activa, 13 tablas, datos de prueba cargados |

**Por qué dos bases separadas:** Para que cualquier error en el desarrollo no afecte la versión que se muestra a stakeholders.

**Las 13 tablas de sinap-production:**

| Tabla | Qué guarda |
|---|---|
| `actor` | Laboratorios, empresas, startups, universidades, centros de investigación |
| `capacidad` | Servicios que cada actor ofrece |
| `necesidad` | Lo que cada actor necesita y no tiene |
| `instrumento` | Subsidios, créditos y concursos de financiamiento disponibles |
| `gap` | Gaps detectados: servicios demandados sin oferta disponible |
| `busqueda` | Registro de todas las consultas a la IA (fuente de inteligencia) |
| `vinculador` | Los operadores que gestionan los procesos de vinculación |
| `iniciativa` | Cada proceso de articulación: vinculación, consorcio, oportunidad, etc. |
| `iniciativa_actor` | Actores participantes de cada iniciativa, con su rol |
| `iniciativa_necesidad` | Necesidades vinculadas a cada iniciativa |
| `iniciativa_capacidad` | Capacidades vinculadas a cada iniciativa |
| `iniciativa_instrumento` | Instrumentos de financiamiento vinculados a cada iniciativa |
| `hito` | Resultados concretos y fechados: reuniones, acuerdos, convenios firmados |

---

### El backend (api/)

Es el motor invisible de la plataforma. No tiene pantallas ni botones — es el programa que recibe preguntas ("dame todos los actores de tipo laboratorio") y devuelve respuestas en formato estructurado.

Está construido con **FastAPI**, un framework de Python. Corre en un servidor y es la única parte del sistema que habla directamente con la base de datos.

**Por qué existe separado del frontend:** Seguridad y orden. El frontend (lo que ve el usuario) nunca toca la base de datos directamente. Todo pasa por el backend, que valida, filtra y controla qué información sale y entra.

**Los 10 endpoints actuales** (un endpoint es como una ventanilla con una función específica):

| Ventanilla | Función |
|---|---|
| `/health` | Verifica que el servidor está vivo |
| `/actors` | Lista actores con filtros |
| `/actors/{id}` | Detalle de un actor con sus servicios y necesidades |
| `/services` | Lista servicios ofrecidos con filtros |
| `/needs` | Lista necesidades activas con filtros |
| `/instruments` | Lista instrumentos de financiamiento |
| `/gaps` | Cruce entre necesidades y servicios disponibles |
| `/gaps/summary` | Métricas: cuántos gaps hay, qué tan graves |
| `/gaps/search-log` | Señales de demanda detectadas en búsquedas IA |
| `/search` | Búsqueda IA: Claude analiza una consulta contra el ecosistema |

---

### El frontend (web/)

Es la interfaz visual: lo que ve y usa el usuario en el navegador. Construido con **Next.js**, el framework de React más usado del mundo.

Las 11 pantallas actuales:

| Pantalla | Qué muestra |
|---|---|
| `/` (inicio) | Dashboard con métricas del ecosistema y acceso a todo |
| `/actors` | Red de actores con filtros por tipo |
| `/actors/[id]` | Ficha completa de un actor |
| `/services` | Catálogo de servicios disponibles |
| `/needs` | Necesidades activas ordenadas por urgencia |
| `/gaps` | Análisis de cobertura del ecosistema |
| `/instruments` | Instrumentos de financiamiento disponibles |
| `/search` | Búsqueda IA: escribís en lenguaje natural, Claude analiza |
| `/iniciativas` | Panel de iniciativas con métricas y filtros |
| `/iniciativas/nueva` | Formulario para registrar una nueva iniciativa |
| `/iniciativas/[id]` | Detalle: actores participantes, vínculos y timeline de hitos |

---

### La IA (Claude / Anthropic)

La función de búsqueda inteligente usa **Claude**, el modelo de IA de Anthropic (la misma empresa detrás de esta conversación).

Cuando un usuario escribe "necesito laboratorio que haga análisis de agua", Claude:
1. Recibe la consulta
2. Lee el estado actual del ecosistema (actores, servicios, necesidades)
3. Identifica qué actores pueden responder a esa necesidad
4. Detecta si hay un gap (nadie puede satisfacerla)
5. Devuelve una respuesta en lenguaje natural + datos estructurados

El registro de cada búsqueda queda guardado en la tabla `busqueda` — eso es inteligencia acumulada sobre qué demanda el ecosistema aunque nadie lo haya declarado formalmente.

---

## Cómo fluye la información

```
El usuario abre el navegador
        ↓
    Next.js (frontend)
    muestra la pantalla
        ↓
    FastAPI (backend)
    procesa la consulta
        ↓
  PostgreSQL (Neon.tech)
   devuelve los datos
        ↓
  (si es búsqueda IA)
  Claude (Anthropic)
  analiza y responde
```

---

## La infraestructura (dónde vive cada parte)

| Parte | Dónde vive | Servicio |
|---|---|---|
| Frontend (Next.js) | En la nube, servidor de Vercel | Vercel |
| Backend (FastAPI) | En la nube, servidor de Railway | Railway |
| Base de datos | En la nube, servidor de Neon | Neon.tech |
| IA | API de Anthropic | Anthropic |
| Dominio sinap.io | DNS de Cloudflare | Cloudflare |
| Código fuente | GitHub | GitHub (org sinap-io) |

**Por qué servicios separados y no un solo servidor:** Cada parte puede escalar, actualizarse o reemplazarse de forma independiente. Si el backend tiene un problema, el frontend sigue funcionando. Si queremos migrar la base de datos, no tocamos el código.

---

## Las cuentas del proyecto

Todo está bajo una identidad propia del proyecto, separada de las cuentas personales de Sebastián. Esto es fundamental para que el proyecto pueda ser mantenido por otra persona sin necesitar acceso a cuentas personales.

| Servicio | Cuenta del proyecto | Estado |
|---|---|---|
| Email base | sinap.io.dev@gmail.com | ✅ Creado |
| GitHub | sinap-io/sinap | ✅ Organización creada, repo transferido |
| Cloudflare | sinap.io.dev@gmail.com | ⏳ Pendiente (dominio sinap.io) |
| Railway | sinap.io.dev@gmail.com | ⏳ Pendiente |
| Vercel | sinap.io.dev@gmail.com | ⏳ Pendiente |
| Neon.tech | Migrar a org | ⏳ Pendiente |

---

## Quién usa SINAP y cómo

### Los dos tipos de usuarios

**Oferente** — es cualquier actor del ecosistema que ofrece servicios: laboratorio, empresa, startup, universidad o centro de investigación. Paga una membresía para estar en la plataforma. Tiene un perfil completo que puede editar, con sus capacidades, equipo y áreas de trabajo.

**Demandante** — es quien busca servicios. El acceso es gratuito. Puede ver todo el catálogo: actores, servicios disponibles, necesidades del ecosistema e instrumentos de financiamiento. No puede publicar servicios propios.

**Regla importante:** el tipo de organización no define el rol. Una startup puede ser oferente y también demandante. Una universidad puede ofrecer servicios y también necesitar otros. El rol lo elige el actor al registrarse.

### El acceso a la plataforma

Toda la plataforma requiere crear una cuenta. No hay acceso como "visitante" sin identificarse — esto garantiza que los datos del ecosistema son accesibles solo para sus actores.

### El orden en que se va a construir lo que falta

1. **Merge a producción** — incorporar el módulo Iniciativas a `main` para activarlo en Railway y sinap-psi.vercel.app
2. **Sistema de login y roles** — registro, acceso diferenciado por rol
3. **Vista marketplace** — el catálogo diferenciado según si sos oferente o demandante

---

## El Módulo Iniciativas

### El problema que motivó este diseño

La primera versión del sistema tenía un módulo llamado "Vinculador" con un esquema simple: un actor que necesita algo + un actor que lo ofrece + un operador que los conecta. Ese modelo funcionaba bien para el caso más básico — pero la realidad del ecosistema biotecnológico resultó ser mucho más compleja.

Tres situaciones que el modelo original no podía representar:

**Primera situación:** Un consorcio de cinco laboratorios se forma para desarrollar biosensores. No hay un demandante ni un oferente — hay cinco actores co-creando algo nuevo. ¿Quién es el "demandante" y quién el "oferente"? Nadie, y los dos, a la vez.

**Segunda situación:** La Universidad de Illinois visita Córdoba y pide vincularse con el Clúster. Es una oportunidad de conexión que puede derivar en muchas cosas — una colaboración académica, un proyecto conjunto, una transferencia tecnológica — pero en este momento es solo un encuentro. No hay necesidad declarada ni servicio disponible. El primer paso es simplemente registrar que esa relación existe y darle seguimiento.

**Tercera situación:** Existe un instrumento de financiamiento europeo para consorcios de biotecnología. Tres actores del ecosistema podrían calificar, pero nadie lo está articulando activamente. Detectar esa oportunidad y empezar a moverla requiere registrarla de alguna forma en el sistema.

En los tres casos, el modelo original no tenía cómo representarlos. El módulo Iniciativas resuelve eso.

---

### Qué es una Iniciativa

Una **Iniciativa** es cualquier proceso de articulación que vale la pena registrar, seguir y documentar dentro del ecosistema.

Puede ser:

| Tipo | Descripción | Ejemplo |
|---|---|---|
| `vinculacion` | Conexión entre actores — el primer paso de casi todo | Reunión con Universidad de Illinois |
| `oportunidad` | Una ventana de mercado o colaboración detectada | Demanda de análisis moleculares en el sector agroindustrial |
| `consorcio` | Grupo de actores que se organizan para hacer algo juntos | Consorcio de biosensores con 5 laboratorios |
| `demanda` | Un actor tiene una necesidad específica que busca cubrir | Startup necesita fermentadores industriales |
| `oferta` | Un actor tiene una capacidad disponible que busca colocar | Laboratorio ofrece nueva línea de bioinformática |
| `instrumento` | Un fondo, subsidio o crédito que actores pueden aprovechar | Convocatoria FONARSEC para consorcios |
| `gap` | Una brecha detectada: se demanda algo que nadie ofrece | No hay servicios de bioseguridad nivel 3 en Córdoba |

Lo que todas tienen en común: son procesos, no fotos. Tienen un estado, evolucionan en el tiempo, involucran actores, y generan resultados concretos que quedan documentados.

---

### Cómo funciona una Iniciativa

Cada iniciativa tiene tres capas:

**1. La iniciativa en sí** — un título, un tipo, un estado (abierta → en curso → concretada) y opcionalmente un vinculador asignado para gestionarla.

**2. Los actores participantes** — cada actor tiene un rol dentro de la iniciativa. Los roles posibles son: líder, demandante, oferente, miembro, candidato o financiador. Una iniciativa puede tener dos actores o doce. Una empresa puede ser líder en una iniciativa y candidato en otra.

**3. Los vínculos con el ecosistema** — la iniciativa puede estar ligada a necesidades, capacidades e instrumentos ya registrados en el sistema. Eso permite cruzar información: si una empresa declara formalmente que necesita fermentadores, y hay una iniciativa de consorcio que incluye fermentadores, el sistema puede detectar esa relación.

Y por encima de las tres capas, están los **hitos**: los resultados concretos y fechados que documentan el avance. Una reunión realizada, un acuerdo alcanzado, un convenio firmado, un financiamiento obtenido. Los hitos son la memoria institucional del proceso.

---

### Por qué el Vinculador es opcional

En el diseño anterior, el vinculador era el centro del módulo — todo giraba en torno a su intervención. El nuevo diseño lo convierte en un recurso disponible, no en un requisito.

Algunas iniciativas van a necesitar un gestor activo — especialmente las vinculaciones complejas, las negociaciones entre múltiples partes, o los consorcios. Otras van a gestionarse solas: dos actores que ya se conocen, que abren una iniciativa de tipo "oferta" simplemente para darle visibilidad y trazabilidad a lo que ya está pasando.

Esto refleja mejor cómo funciona el ecosistema real: no todo pasa por el escritorio del Clúster, pero sí conviene que todo quede registrado.

---

### Quién puede abrir una Iniciativa

Este punto es deliberado y no menor. No cualquier actor puede abrir una iniciativa en cualquier momento — eso generaría ruido, iniciativas abandonadas y pérdida de calidad en la información.

El modelo define tres perfiles con diferentes niveles de autorización:

- **Comisión Directiva** — los actores que integran la conducción del Clúster. Tienen el nivel más alto de autorización y pueden abrir y gestionar cualquier tipo de iniciativa.
- **Vinculador** — los operadores del Clúster designados para gestionar procesos. Pueden abrir iniciativas en nombre del Clúster.
- **Actor habilitado** — en el futuro, actores específicos podrán tener permiso para abrir ciertos tipos de iniciativas (por ejemplo, publicar su propia oferta o demanda).

La IA puede *sugerir* iniciativas — si detecta un gap o una oportunidad latente, puede proponerla — pero no puede crearlas. Siempre hay un humano con la autorización adecuada que confirma antes de que algo quede registrado como iniciativa activa.

---

### Por qué esto es central para SINAP

El catálogo de actores, servicios, necesidades e instrumentos es el mapa del ecosistema — describe lo que hay. Las Iniciativas son la capa operativa — describen lo que está pasando.

Sin iniciativas, SINAP es un directorio inteligente. Con iniciativas, SINAP es el sistema operativo de la articulación: cada conexión que el Clúster facilita queda registrada, tiene trazabilidad, genera métricas y acumula conocimiento institucional sobre qué tipo de colaboraciones funcionan, entre quiénes, con qué instrumentos y en qué tiempos.

Con el tiempo, esa base de iniciativas concretadas se convierte en el activo más valioso de la plataforma: evidencia concreta del impacto del Clúster en el ecosistema.

---

## Glosario

| Término | Qué significa en este contexto |
|---|---|
| **Backend** | El motor invisible que procesa datos. No tiene pantallas. |
| **Frontend** | La interfaz visual que ve el usuario en el navegador. |
| **Base de datos** | Donde se guarda toda la información de forma estructurada. |
| **API** | Una ventanilla digital que recibe preguntas y devuelve respuestas. |
| **Endpoint** | Una ventanilla específica de la API (ej: la que devuelve actores). |
| **Deploy** | El proceso de publicar el código en internet para que sea accesible. |
| **Framework** | Un conjunto de herramientas y convenciones para construir software. |
| **Tabla** | Como una hoja de cálculo dentro de la base de datos. |
| **Gap** | Un servicio que se demanda pero no se oferta (o viceversa). |
| **Vinculador** | El operador humano que gestiona los procesos de conexión entre actores. |
| **Hito** | Un resultado concreto y documentado dentro de un proceso de vinculación. |
| **Migración** | Un cambio controlado en la estructura de la base de datos. |
| **GitHub** | La plataforma donde se guarda y versiona el código. |
| **Commit** | Un punto de guardado en el historial del código, con descripción. |
| **Branch** | Una línea de trabajo paralela en el código, sin afectar la versión principal. |
| **PR (Pull Request)** | La propuesta de incorporar cambios de una branch a la versión principal. |

---

*SINAP — Clúster de Biotecnología de Córdoba, Argentina*
