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
| `sinap-production` | La versión productiva | Activa, 9 tablas, datos de prueba cargados |

**Por qué dos bases separadas:** Para que cualquier error en el desarrollo no afecte la versión que se muestra a stakeholders.

**Las 9 tablas de sinap-production:**

| Tabla | Qué guarda |
|---|---|
| `actor` | Laboratorios, empresas, startups, universidades, centros de investigación |
| `capacidad` | Servicios que cada actor ofrece |
| `necesidad` | Lo que cada actor necesita y no tiene |
| `instrumento` | Subsidios, créditos y concursos de financiamiento disponibles |
| `gap` | Gaps detectados: servicios demandados sin oferta disponible |
| `busqueda` | Registro de todas las consultas a la IA (fuente de inteligencia) |
| `vinculador` | Los operadores que gestionan los procesos de vinculación |
| `caso_vinculacion` | Cada proceso de conectar dos actores |
| `hito` | Los resultados concretos: reuniones, acuerdos, convenios firmados |

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

Las 9 pantallas actuales:

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

1. **Módulo Vinculador** (lo que sigue ahora) — gestión de casos de vinculación entre actores
2. **Sistema de login y roles** — registro, acceso diferenciado por rol
3. **Vista marketplace** — el catálogo diferenciado según si sos oferente o demandante

---

## El Módulo Vinculador

Es el módulo que convierte SINAP de un directorio inteligente a un sistema operativo de vinculación. Su función es gestionar el proceso completo desde que se detecta una conexión posible hasta que se produce un resultado concreto (reunión, acuerdo, convenio, financiamiento obtenido).

**Las tres tablas que lo sostienen ya están creadas en la base de datos.** Lo que falta construir es la interfaz y los endpoints del backend.

**Flujo de trabajo del vinculador:**
```
Se detecta un gap (necesidad sin oferta)
        ↓
Se abre un caso de vinculación
(actor demandante + actor oferente + necesidad)
        ↓
El vinculador gestiona el proceso
        ↓
Se registran hitos: contacto → reunión → acuerdo → convenio
        ↓
El caso se cierra con resultado documentado
```

Cada caso cerrado con éxito enriquece la base de conocimiento: qué actores colaboran, qué instrumentos financian, qué tipos de vinculación funcionan.

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
