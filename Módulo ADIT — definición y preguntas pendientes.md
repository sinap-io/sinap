# Módulo ADIT en SINAP — Definición completa y preguntas pendientes

*Documento de trabajo — Sebastián y Pablo — abril 2026*

---

## Qué es el módulo ADIT

El ADIT (Agente de Desarrollo e Innovación Territorial) es un vinculador que opera en una zona geográfica específica. Su trabajo es detectar necesidades en el ecosistema, conectar actores, activar iniciativas y hacer seguimiento hasta que se concretan resultados.

SINAP registra todo ese trabajo con trazabilidad completa: qué iniciativas abrió cada ADIT, qué hitos registró, qué resultados generó y en qué período. Con esa información, el Clúster puede evaluar el desempeño de cada ADIT y calcular su remuneración variable.

---

## Qué tendría que existir en la plataforma

### 1. El ADIT como entidad

Hoy el vinculador en SINAP tiene solo nombre, email y estado activo/inactivo. Para el módulo ADIT habría que agregar:

- **Zona geográfica** — el territorio que tiene asignado (ej: Córdoba Capital, Villa María, Río Cuarto)
- **Vinculación con su usuario** — hoy el vinculador y el usuario que se loguea son dos entidades separadas. Hay que conectarlos para que SINAP sepa automáticamente qué ADIT está registrando cada cosa
- **Porcentaje de comisión** — su % sobre los resultados que genera (ver sección de cobro)

### 2. Las iniciativas que gestiona

Cada iniciativa que abra un ADIT tiene que registrar:

- **Quién la creó** — el ADIT que abrió la iniciativa. Si no lo registramos desde el principio, no hay forma de reconstruirlo después. Este es el campo más crítico de implementar antes de que haya datos reales.
- **Monto estimado** — el valor potencial del negocio o proyecto si la iniciativa se concreta. *Ver preguntas pendientes.*
- **Tipo de resultado esperado** — qué define el éxito para esa iniciativa específica: ¿un convenio firmado? ¿una venta concretada? ¿financiamiento obtenido? ¿una mesa realizada? *Ver preguntas pendientes.*
- **Historial de estados** — no solo el estado actual (abierta, en curso, concretada) sino cuándo cambió cada estado. Necesario para calcular tiempos de conversión y atribuir resultados al período correcto.

### 3. Los hitos que registra

Cada hito (reunión, acuerdo, convenio, financiamiento) tiene que registrar:

- **Quién lo cargó** — el ADIT que lo registró. Mismo principio que las iniciativas: dato que no se puede reconstruir retroactivamente.
- **Monto concreto** (opcional) — el valor real generado cuando el hito es económicamente medible. Por ejemplo: un hito de tipo "financiamiento obtenido" de $5M es un dato limpio y verificable. Distinto del monto estimado de la iniciativa, que es una proyección.

### 4. Los actores del ecosistema

- **Zona geográfica** — dónde está ubicado el actor. Permite cruzar con el territorio del ADIT y detectar si hay oferta local o hay que buscar fuera de la zona.
- **Perfil en el ecosistema** — Pablo propuso reemplazar o complementar el tipo actual (empresa, startup, universidad) con: oferente, demandante, investigador, inversor/financiador, organismo de apoyo. *Ver preguntas pendientes.*

### 5. Los roles dentro de las iniciativas

Pablo propuso reemplazar los roles actuales por 6 más precisos y alineados con la realidad del trabajo de vinculación:

| Rol propuesto | Descripción |
|---|---|
| Líder | La empresa o entidad que impulsa y coordina el proyecto |
| Coejecutor | Universidad o centro tecnológico que desarrolla una parte técnica |
| Vinculador | El Clúster, incubadora o agencia que conecta a las partes |
| Financiador | Fondo, programa público o inversor que aporta recursos |
| Adoptante / usuario piloto | Hospital, productor o empresa que prueba la solución en un caso real |
| Regulador / soporte institucional | Ministerio, municipio o agencia pública que habilita o acompaña |

### 6. Las áreas temáticas

Pablo propuso reemplazar las categorías actuales por:

**Categorías principales:**
- Salud humana
- Agroindustria
- Biomateriales / bioproductos
- Bioinformática / biotecnología digital
- Medio ambiente / bioeconomía circular
- Otros

**Subcategorías de agroindustria:**
- Agricultura, ganadería, alimentos, bioinsumos, genética / reproducción, sanidad animal, otros

---

## Cómo funciona el cobro del ADIT

### Lo que SINAP puede proveer

La plataforma registra todo el trabajo del ADIT con fecha y autoría. Al cierre de cada período puede generar un reporte por ADIT con:

| Indicador | Cómo se mide en SINAP |
|---|---|
| Nuevas oportunidades de negocio | Iniciativas tipo "oportunidad" creadas por el ADIT en el período |
| Convenios facilitados | Hitos "convenio firmado" registrados por el ADIT |
| Proyectos colaborativos activados | Iniciativas tipo "consorcio" abiertas por el ADIT |
| Acceso a financiamiento | Hitos "financiamiento obtenido" con monto |
| Vinculaciones concretadas | Iniciativas concretadas gestionadas por el ADIT |
| Startups impulsadas | Actores tipo startup incorporados a iniciativas del ADIT |
| Mesas interinstitucionales | Hitos tipo "mesa interinstitucional" (nuevo tipo a agregar) |
| Eventos territoriales | Hitos tipo "evento territorial" (nuevo tipo a agregar) |
| Participación universitaria | Actores tipo universidad en iniciativas del ADIT |

### Lo que no puede proveer SINAP

Algunos indicadores del variable requieren información que viene de fuera de la plataforma:

- **Visibilidad del programa** — métricas de comunicación (redes sociales, notas de prensa). No aplica a una base de datos de vinculación.
- **Innovación en PyMEs con valorización monetaria** — requiere reportes externos de las propias empresas sobre su facturación o inversión en innovación.
- **Compras de servicios/productos locales con montos** — requiere datos de facturación que SINAP no tiene ni debería tener.
- **Integración con agencias provinciales** — es un indicador institucional que se evalúa por otros medios.

### Dónde vive el cálculo del pago

**Recomendación: el cálculo del pago vive fuera de SINAP.**

SINAP genera el reporte con todos los indicadores cuantificados. El Clúster aplica la fórmula del variable en una planilla de cálculo o en su sistema administrativo y aprueba el pago.

Esto tiene una ventaja clave: la fórmula del variable va a cambiar, especialmente al principio. Si el cálculo está en una planilla, ajustarlo es trivial. Si está en código, cada ajuste es un desarrollo.

---

## Lo que hay que implementar antes de que haya datos reales

Estos tres cambios no pueden esperar porque si no se hacen desde el principio, los datos que se carguen no van a tener la información necesaria para calcular el variable:

1. **`creado_por` en iniciativas** — para saber qué ADIT abrió cada iniciativa
2. **`creado_por` en hitos** — para atribuir cada hito a su ADIT
3. **Conectar vinculador con usuario** — para que el sistema sepa automáticamente quién está registrando

Todo lo demás puede implementarse cuando esté definido sin perder datos históricos.

---

## Preguntas para Pablo

### Sobre la zona geográfica

**P1.** ¿Cuántos ADITs va a haber y en qué zonas? ¿Están las zonas definidas o son flexibles?

*Por qué importa:* si son pocas zonas fijas (Córdoba Capital, Villa María, Río Cuarto) lo implementamos como una lista cerrada, que es mejor para filtrar y reportar. Si las zonas pueden cambiar o subdividirse, necesitamos un diseño más flexible.

---

### Sobre el monto de las iniciativas

**P2.** ¿Quién carga el monto estimado de una iniciativa — el ADIT que la gestiona, o alguien del Clúster que lo valida?

*Por qué importa:* si el ADIT carga el monto sobre el que después cobra comisión, hay un problema de incentivos (tiende a sobreestimar). Si lo valida el Clúster, el proceso es más sano pero requiere un paso de aprobación.

**P3.** El monto estimado de una iniciativa, ¿es el valor del negocio potencial (ej: una venta de $50M entre dos empresas) o el valor del financiamiento que se puede obtener (ej: un subsidio de $5M)?

*Por qué importa:* son muy distintos en magnitud y en verificabilidad. El financiamiento obtenido es fácil de verificar (hay una resolución o contrato). El valor de negocio entre privados es más difícil.

---

### Sobre el resultado positivo

**P4.** ¿El "resultado positivo" que habilita el cobro del ADIT es el mismo para todos los tipos de iniciativa, o cada tipo tiene su propio criterio?

*Por qué importa:* para una vinculación, el resultado positivo podría ser "reunión realizada" o "acuerdo alcanzado". Para un consorcio, podría ser "convenio firmado". Para financiamiento, "financiamiento obtenido". Si cada tipo tiene su criterio, hay que definirlos uno por uno.

**P5.** ¿El resultado que habilita el cobro lo valida alguien del Clúster antes de que se compute, o es automático cuando el ADIT registra el hito correspondiente?

*Por qué importa:* si es automático, el ADIT podría registrar hitos que no ocurrieron realmente. Si requiere validación del Clúster, necesitamos un flujo de aprobación en la plataforma.

---

### Sobre la comisión

**P6.** ¿La comisión del ADIT es un porcentaje fijo igual para todos, o varía por ADIT, por tipo de resultado, o por monto?

*Por qué importa:* si es fija e igual para todos, es un campo simple en el perfil del ADIT. Si varía, necesitamos una tabla más compleja que defina la comisión por tipo de resultado.

**P7.** ¿El período de cálculo del variable es mensual, trimestral o anual?

*Por qué importa:* define cómo estructuramos los reportes y con qué frecuencia se generan.

---

### Sobre el perfil del actor

**P8.** ¿El perfil del actor (oferente, demandante, investigador, inversor, organismo de apoyo) reemplaza al tipo actual (empresa, startup, universidad, gobierno, investigador) o es una dimensión adicional?

*Por qué importa:* un actor puede ser "empresa" (tipo) y "oferente" (perfil) al mismo tiempo — esas son dos cosas distintas. Si son dos dimensiones, un actor tiene ambos campos. Si el perfil reemplaza al tipo, migramos los datos existentes y eliminamos el campo anterior.

---

*Documento generado en sesión de trabajo SINAP — abril 2026*
*Próximo paso: compartir con Pablo para resolver las preguntas antes de implementar el módulo ADIT completo*
