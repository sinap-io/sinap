# Sinap — Backlog

Ideas y funcionalidades identificadas para versiones futuras.

---

## v2 — Próxima versión

### Matching IA: necesidades ↔ financiamiento
Un actor describe su necesidad y la IA identifica instrumentos de financiamiento relevantes (ANR, FONARSEC, BICE, fondos provinciales) con justificación y próximos pasos.
- Mismo patrón técnico que el matching de capacidades
- Potencial de alertas proactivas: "hay una convocatoria nueva que aplica a tu perfil"

### Sistema de usuarios y roles
- Admin Clúster: gestión completa
- Actor miembro: carga y edita su propio perfil
- Visitante: búsqueda limitada

### Modelo de acceso lado demanda
- Freemium / socio básico Clúster / prueba gratuita X días
- A definir post-discovery sessions

---

## v3 — Futuro

### Alertas proactivas de financiamiento
Notificaciones automáticas cuando aparece una convocatoria que aplica al perfil de un actor.

### Módulo de talento científico
Perfiles de investigadores y graduados recomendados por facultades para necesidades puntuales de empresas.

### Gaps automáticos
Detección automática de necesidades sin oferta disponible → oportunidades de mercado para el Clúster.

### Búsqueda con IA — seguimiento conversacional ante gaps
- Cuando la IA detecta cobertura baja o nula, iniciar una pregunta de seguimiento en lenguaje libre
- Ejemplos: etapa del proyecto (investigación/prototipo/escala), si tienen equipamiento propio, si buscan servicio puntual o colaboración I+D
- Objetivo: refinar el match con más contexto y documentar mejor el gap en la tabla `gap`
- Prerequisito: más actores y servicios cargados en la red para que el matching sea útil

### Decisión de arquitectura — versión producción
- Stack definido: FastAPI (backend) + Next.js (frontend)
- Migrar desde Streamlit cuando el prototipo esté validado con stakeholders
- La BD en Neon PostgreSQL no cambia, toda la lógica es transferible
- Prerequisito: reuniones de validación con CEPROCOR y LACE
```

Luego:
```
git add BACKLOG.md
git commit -m "Add architecture decision: FastAPI + Next.js for production"
git push
---

*Actualizado: marzo 2026*