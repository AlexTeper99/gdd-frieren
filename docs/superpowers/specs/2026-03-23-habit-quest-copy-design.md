# Habit Quest — Copy System & Voice Guide

**Date:** 2026-03-23
**Task:** 1.7 — Copy fijo de la app (no AI-generated)
**Based on:** GDD v4.2, brainstorming session 2026-03-23

---

## Scope

Este documento cubre **todo el texto fijo** de la app. No cubre narrativa AI-generated (situaciones, consecuencias, escenas de vínculo, weekly close, resoluciones de arco, prólogo).

Cada string tiene 3 variantes (A, B, C). La variante recomendada está marcada con ★.

---

## Voice Chart

### Concepto 1: Mundo, no app

**Características:** Inmersivo, diegético, presente.

La app no le habla al usuario como software. Le habla como el mundo que habita. No hay "tu cuenta", hay "tu personaje". No hay "recordatorios", hay rituales que esperan. La interfaz es una ventana al mundo, no un dashboard.

**Sí:**
- "Tu ritual espera."
- "El mundo escuchó."

**No:**
- "Recordatorio: completá tu hábito."
- "Tu actividad fue registrada exitosamente."

---

### Concepto 2: Peso sin juicio

**Características:** Serio, respetuoso, honesto.

Las cosas tienen consecuencias pero la app nunca señala con el dedo. No celebra con exclamaciones ni castiga con culpa. Cuando algo sale mal, el mundo cambia. Cuando algo sale bien, el personaje avanza. La app confía en que el usuario nota la diferencia solo.

**Sí:**
- (stat bar baja silenciosamente)
- "La niebla avanza." (como empty state de decay)

**No:**
- "Llevás 2 días sin registrar."
- "Excelente trabajo completando todos tus rituales."

---

### Concepto 3: Corto y preciso

**Características:** Económico, directo, sin relleno.

Cada palabra tiene que ganarse su lugar. Frieren no explica — muestra. El copy hace lo mismo. Si se puede decir en 4 palabras, no se usan 8. Las oraciones no superan 12 palabras. Los botones no superan 3.

**Sí:**
- "Firmar pacto."
- "Hoy decidís vos."

**No:**
- "Tocá el botón de abajo para firmar el pacto de esta semana."
- "Hoy es tu turno de escribir la decisión del día."

---

### Concepto 4: RPG primero

**Características:** Lúdico, mecánico, con peso narrativo.

La terminología viene del RPG, no de la productividad. "Ritual" en vez de "hábito". "Arco" en vez de "mes". "Poder" en vez de "progreso". Los elementos de juego (stats, racha, boss, pacto) son ciudadanos de primera clase en la interfaz, no decoración.

**Sí:**
- "Misión del arco"
- "Boss semanal bloqueado."
- "Poder: 72"

**No:**
- "Tu objetivo mensual"
- "Desafío semanal no disponible."
- "Progreso general: 72%"

---

## Glosario UI

| Interno | UI | Nota |
|---|---|---|
| Conducta / habit | **Ritual** | La acción concreta con hora y lugar |
| Objetivo mensual | **Misión del arco** | El área de foco |
| Tap de conducta | **Registrar** | Verbo en botón |
| Pacto semanal | **Pacto** | |
| Stats primarios | **VIT / STR / INT / STA** | |
| Stat derivado | **Poder** | Promedio de stats + racha |
| Streak | **Racha** | Días consecutivos |
| Weekly Boss | **Boss semanal** | |
| Monthly Arc | **Arco** | |
| Day level | *(invisible al usuario)* | Solo input para AI |

**Palabras prohibidas en UI:** objetivo, meta, progreso, productividad, recordatorio, completar, logro, achievement, check-in, hábito.

---

## 1. Onboarding

### Pantalla 1 — La llegada

Pantalla oscura. Texto aparece como si se escribiera.

**Frase de apertura:**

| # | Variante | Palabras |
|---|---|---|
| A | "Toda historia empieza con una decisión." | 6 |
| B | ★ "Cada decisión construye a quien sos." | 6 |
| C | "El camino empieza cuando decidís quién ser." | 7 |

**Botón:**

| # | Variante |
|---|---|
| A | "Empezar" |
| B | ★ "Decidir" |
| C | "Entrar" |

---

### Pantalla 2 — Identidad y personaje

**Pregunta de identidad:**

| # | Variante |
|---|---|
| A | "¿Quién querés ser?" |
| B | ★ "¿Quién decidís ser?" |
| C | "¿En quién te estás convirtiendo?" |

**Helper de identidad:**

| # | Variante |
|---|---|
| A | "Quién, no qué." |
| B | ★ "Pensalo. No hay respuesta incorrecta." |
| C | "La identidad guía todo lo demás." |

**Placeholder de identidad:**

| # | Variante |
|---|---|
| A | "Soy alguien que cuida lo que come." |
| B | ★ "Soy alguien que cuida cómo vive." |
| C | "Soy alguien que se mueve todos los días." |

**Pregunta de nombre:**

| # | Variante |
|---|---|
| A | "Nombrá a tu personaje." |
| B | ★ "¿Cómo se llama?" |
| C | "Tu personaje necesita un nombre." |

**Helper de nombre:**

| # | Variante |
|---|---|
| A | "Puede ser tu nombre. Puede ser otro." |
| B | ★ "Real o inventado." |
| C | "El nombre es el primer acto de identidad." |

**Botón:**

| # | Variante |
|---|---|
| A | "Siguiente" |
| B | ★ "Continuar" |
| C | "Avanzar" |

---

### Pantalla 3 — El arquetipo

**Título:**

| # | Variante |
|---|---|
| A | "Elegí tu clase." |
| B | ★ "Tu arquetipo." |
| C | "¿Qué tipo de personaje sos?" |

**Guerrero:**

| # | Variante |
|---|---|
| A | "Disciplina física. Lo que entrenás, lo controlás." |
| B | ★ "Tu fuerza es tu cuerpo. Lo que entrenás, responde." |
| C | "Construís con el cuerpo. Tu disciplina es física." |

**Stats sugeridos:** STR + VIT

**Mago:**

| # | Variante |
|---|---|
| A | "Disciplina mental. Lo que ordenás, se aclara." |
| B | ★ "Mente clara, decisiones claras." |
| C | "Construís con la mente. Tu disciplina es mental." |

**Stats sugeridos:** INT + STA

**Ranger:**

| # | Variante |
|---|---|
| A | "Disciplina flexible. Lo que no te frena, te fortalece." |
| B | ★ "Ningún día es igual. Esa es tu ventaja." |
| C | "Construís en movimiento. Tu disciplina es adaptación." |

**Stats sugeridos:** Balance (todos)

**Curandero:**

| # | Variante |
|---|---|
| A | "Disciplina interna. Lo que cuidás, crece." |
| B | ★ "Lo que cuidás por dentro se nota por fuera." |
| C | "Construís desde adentro. Tu disciplina es cuidado." |

**Stats sugeridos:** VIT + STA

---

### Pantalla 4 — Misión del arco y rituales

**Título:**

| # | Variante |
|---|---|
| A | "Tu primer arco." |
| B | ★ "Misión del arco." |
| C | "¿Cuál es la misión?" |

**Subtítulo:**

| # | Variante |
|---|---|
| A | "Un área por arco." |
| B | ★ "Elegí una sola área para este primer arco." |
| C | "Todo el arco gira alrededor de esto." |

**Label "Qué":**

| # | Variante |
|---|---|
| A | "El ritual. Concreto." |
| B | ★ "¿Qué vas a hacer?" |
| C | "La acción." |

**Placeholder Qué:** "Preparar mi desayuno"

**Label "Cuándo":**

| # | Variante |
|---|---|
| A | "Hora exacta." |
| B | ★ "¿A qué hora?" |
| C | "Cuándo." |

**Placeholder Cuándo:** "7:30"

**Label "Dónde":**

| # | Variante |
|---|---|
| A | "Lugar específico." |
| B | ★ "¿Dónde?" |
| C | "El lugar." |

**Placeholder Dónde:** "Mi cocina"

**Label "Si no puedo":** (opcional, colapsado)

| # | Variante |
|---|---|
| A | "Si ese día no se puede..." |
| B | ★ "Plan alternativo." |
| C | "¿Y si no podés?" |

**Helper contingencia:**

| # | Variante |
|---|---|
| A | "El ritual no se rompe. Se adapta." |
| B | ★ "Mismo rumbo, distinto camino." |
| C | "Mejor un plan B que ningún plan." |

**Placeholder contingencia:** "Desayuno simple, pero real."

**Botón agregar ritual:**

| # | Variante |
|---|---|
| A | "Agregar ritual" |
| B | ★ "Otro ritual" |
| C | "+ Ritual" |

**Límite:** "Hasta 3 rituales por arco."

---

### Pantalla 5 — Invitar

**Título:**

| # | Variante |
|---|---|
| A | "Tu compañero de viaje." |
| B | ★ "¿Quién camina con vos?" |
| C | "Invitá a la otra persona." |

**Subtítulo:**

| # | Variante |
|---|---|
| A | "La historia se escribe de a dos." |
| B | ★ "Cuando los dos confirmen, nace el mundo." |
| C | "El mundo se genera cuando los dos entren." |

**Label email:**

| # | Variante |
|---|---|
| A | "Su email." |
| B | ★ "Email." |
| C | "Dirección de email." |

**Botón:**

| # | Variante |
|---|---|
| A | "Enviar invitación" |
| B | ★ "Invitar" |
| C | "Enviar" |

**Skip (si quiere jugar solo):**

| # | Variante |
|---|---|
| A | "Seguir solo" |
| B | ★ "Empezar solo" |
| C | "Sin compañero por ahora" |

---

## 2. Notificaciones de rituales

Templates con variables: `[nombre]` = nombre del personaje, `[ritual]` = nombre del ritual, `[hora]` = hora configurada, `[lugar]` = lugar configurado.

**Notificación de ritual (push):**

| # | Variante | Ejemplo |
|---|---|---|
| A | "[nombre], [ritual] espera. [lugar], [hora]." | "Kael, el desayuno espera. Tu cocina, 7:30." |
| B | ★ "[nombre]. [ritual]. [lugar], [hora]." | "Kael. El desayuno. Tu cocina, 7:30." |
| C | "[ritual] espera. [lugar], [hora]." | "El desayuno espera. Tu cocina, 7:30." |

**Permiso de notificaciones:**

| # | Variante |
|---|---|
| A | "Cada ritual tiene su hora. Activá notificaciones." |
| B | ★ "Los rituales llegan a su hora. Necesitan notificaciones." |
| C | "Sin notificaciones no hay señal. Activar." |

---

## 3. Rituales — Tap UI

**Pill completado:** "✓ [nombre del ritual]"
**Pill pendiente:** "○ [nombre del ritual]"

**Feedback post-tap:**

| # | Variante | Ejemplo |
|---|---|---|
| A | "[STAT] +[n]" | "VIT +3" |
| B | ★ "[STAT] +[n] · Racha [n]d" | "VIT +3 · Racha 5d" |
| C | "+[n] [STAT]" | "+3 VIT" |

**Todos los rituales del día completos:**

| # | Variante |
|---|---|
| A | "Rituales completos." |
| B | ★ "Día completo." |
| C | "Todo registrado." |

---

## 4. Mecánica de escritura

### Botón de escritura — por hora del día

**Mañana (6:00–11:59):**

| # | Variante |
|---|---|
| A | "¿Qué decide [nombre] hoy?" |
| B | ★ "El camino se abre. ¿Qué decide [nombre]?" |
| C | "[nombre]. El día empieza." |

**Mediodía (12:00–17:59):**

| # | Variante |
|---|---|
| A | "El camino sigue. ¿Cómo avanza?" |
| B | ★ "El día avanza. ¿Qué decide [nombre]?" |
| C | "[nombre] sigue en marcha." |

**Noche (18:00–05:59):**

| # | Variante |
|---|---|
| A | "¿Cómo termina este capítulo?" |
| B | ★ "Cae la noche. ¿Qué decide [nombre]?" |
| C | "El día termina. Última decisión." |

### Campo de decisión

**Placeholder:**

| # | Variante |
|---|---|
| A | "Tu decisión. 1-2 oraciones." |
| B | ★ "¿Qué hace [nombre]?" |
| C | "Escribí lo que decide tu personaje." |

### Confirmación post-escritura

| # | Variante |
|---|---|
| A | "El reino toma nota." |
| B | ★ "El mundo escuchó." |
| C | "Decisión tomada." |

---

## 5. Sistema de turnos

### Es tu turno

**Indicador:**

| # | Variante |
|---|---|
| A | "Tu turno." |
| B | ★ "Hoy decidís vos." |
| C | "Es tu turno de escribir." |

### No es tu turno

**Indicador:**

| # | Variante |
|---|---|
| A | "Turno de [nombre]." |
| B | ★ "Hoy decide [nombre]." |
| C | "No es tu turno." |

**Subtítulo (leés lo de ayer):**

| # | Variante |
|---|---|
| A | "Leé lo que pasó ayer." |
| B | ★ "Ayer [nombre] decidió. Así salió." |
| C | "La escena de ayer." |

**Cierre del día sin turno:**

| # | Variante |
|---|---|
| A | "Mañana te toca." |
| B | ★ "Tu turno es mañana." |
| C | "El mundo avanza mañana con tu turno." |

---

## 6. Ritual del domingo

### Labels de pasos

| Paso | Variante A | ★ Variante B | Variante C |
|---|---|---|---|
| 1 | "Cierre semanal" | "Lo que pasó esta semana" | "Cierre de la semana" |
| 2 | "Boss semanal" | "El boss" | "Boss de la semana" |
| 3 | "Nuevo pacto" | "El pacto" | "Pacto de la semana" |
| 4 | "Firma" | "Sellar" | "La firma" |

### Las 4 preguntas del pacto

**Pregunta 1 — Obstáculos:**

| # | Variante |
|---|---|
| A | "¿Qué se viene difícil esta semana?" |
| B | ★ "¿Qué puede complicar tus rituales?" |
| C | "Obstáculos de la semana." |

**Pregunta 2 — Plan:**

| # | Variante |
|---|---|
| A | "¿Cómo lo enfrentás?" |
| B | ★ "¿Cuál es el plan?" |
| C | "Tu estrategia para esos obstáculos." |

**Pregunta 3 — Apoyo mutuo:**

| # | Variante |
|---|---|
| A | "¿Qué necesitás del otro?" |
| B | ★ "¿Cómo se cubren esta semana?" |
| C | "¿Cómo se ayudan?" |

**Pregunta 4 — Opcional (colapsado):**

| # | Variante |
|---|---|
| A | "¿Suman algo nuevo?" |
| B | ★ "¿Quieren agregar algo esta semana?" |
| C | "Algo extra." |

### Firma

**Botón:**

| # | Variante |
|---|---|
| A | "Firmar" |
| B | ★ "Sellar pacto" |
| C | "Firmar pacto" |

**Confirmación post-firma:**

| # | Variante |
|---|---|
| A | "Pacto sellado." |
| B | ★ "Sellado hasta el domingo." |
| C | "Pacto activo." |

**Esperando firma del otro:**

| # | Variante |
|---|---|
| A | "Esperando a [nombre]." |
| B | ★ "Falta la firma de [nombre]." |
| C | "[nombre] todavía no firmó." |

---

## 7. Navegación

| Sección | Variante A | ★ Variante B | Variante C |
|---|---|---|---|
| Historial | "Capítulos" | "Historial" | "Historia" |
| Pantalla principal | "El Mundo" | "Mundo" | "El Mundo" |
| Co-op | "Nosotros" | "Nosotros" | "El equipo" |

---

## 8. Pantalla Nosotros

**Título dinámico:**

| # | Variante |
|---|---|
| A | "Esta semana en [reino]..." |
| B | ★ "[reino]. Semana [n]." |
| C | "Semana [n] en [reino]." |

**Labels fijos:**

| Elemento | Texto |
|---|---|
| Pacto | "Pacto activo" |
| Arco | "Arco: [nombre] — semana [n] de [total]" |
| Boss | "Boss semanal" |
| Boss desbloqueado | "desbloqueado" |
| Boss bloqueado | "bloqueado" |
| Racha P1 | "[nombre] · [n]d · [stat]%" |
| Racha P2 | "[nombre] · [n]d · [stat]%" |
| Poder P1 | "Poder: [n]" |
| Poder P2 | "Poder: [n]" |

---

## 9. Cierre de arco

**Pregunta de transición:**

| # | Variante |
|---|---|
| A | "El arco termina. ¿Qué viene después?" |
| B | ★ "Un arco se cierra. ¿Qué querés descubrir en el siguiente?" |
| C | "Nuevo arco. ¿En qué dirección?" |

**Placeholder:**

| # | Variante |
|---|---|
| A | "Escribí libre." |
| B | ★ "Lo que quieras explorar." |
| C | "La dirección del próximo arco." |

---

## 10. Elementos diferidos (Pantalla 6-7, Phase 6)

Para referencia futura. No se implementan en Phase 1.

### Pantalla 6 — Generación del mundo

**Loading texts (secuenciales):**

| # | Variante A | ★ Variante B | Variante C |
|---|---|---|---|
| 1 | "Nombrando el reino..." | "Un reino toma forma..." | "El mundo se despierta..." |
| 2 | "Dando vida a los primeros habitantes..." | "Nacen los primeros habitantes..." | "Alguien más vive ahí ahora..." |
| 3 | "Escribiendo el primer capítulo..." | "La historia empieza a escribirse..." | "El primer capítulo se escribe solo..." |

### Pantalla 7 — El prólogo

**Tagline:**

| # | Variante |
|---|---|
| A | "Ni vos sabés cómo termina." |
| B | ★ "Nadie sabe cómo termina." |
| C | "El final todavía no existe." |

**Botón:**

| # | Variante |
|---|---|
| A | "Comenzar" |
| B | ★ "Entrar al mundo" |
| C | "Empezar" |

---

## 11. Errores

Siguiendo patrón UX: [Qué falló]. [Contexto]. [Qué hacer].
Adaptado a voz RPG: el mundo falla, no la app.

### Conexión perdida

| # | Variante |
|---|---|
| A | "Sin conexión. Revisá tu señal." |
| B | ★ "El mundo no responde. Revisá tu conexión." |
| C | "Conexión perdida. Sin señal no hay camino." |

**Botón:** "Reintentar"

### Error al guardar

| # | Variante |
|---|---|
| A | "No se pudo guardar. Intentá de nuevo." |
| B | ★ "El registro falló. Intentá otra vez." |
| C | "Algo falló. Volvé a intentar." |

**Botón:** "Reintentar"

### Auth — link inválido o expirado

| # | Variante |
|---|---|
| A | "El enlace expiró. Pedí uno nuevo." |
| B | ★ "Enlace inválido o expirado. Pedí otro." |
| C | "Este enlace ya no sirve. Generá uno nuevo." |

**Botón:** "Pedir nuevo enlace"

### Error de generación AI

| # | Variante |
|---|---|
| A | "La narrativa no se pudo generar. Intentá en unos minutos." |
| B | ★ "El mundo no pudo responder. Intentá de nuevo." |
| C | "La historia se trabó. Volvé a intentar." |

**Botón:** "Reintentar"

### Error de validación — onboarding

**Nombre vacío:**

| # | Variante |
|---|---|
| A | "Tu personaje necesita un nombre." |
| B | ★ "Falta el nombre." |
| C | "Sin nombre no hay personaje." |

**Identidad vacía:**

| # | Variante |
|---|---|
| A | "Escribí quién decidís ser." |
| B | ★ "La identidad no puede estar vacía." |
| C | "Necesitás una identidad para empezar." |

**Ritual sin hora:**

| # | Variante |
|---|---|
| A | "El ritual necesita una hora." |
| B | ★ "¿A qué hora? Sin hora no hay señal." |
| C | "Falta la hora del ritual." |

**Ritual sin lugar:**

| # | Variante |
|---|---|
| A | "¿Dónde? El lugar activa la señal." |
| B | ★ "Falta el lugar." |
| C | "El ritual necesita un lugar." |

**Email inválido:**

| # | Variante |
|---|---|
| A | "Revisá el email." |
| B | ★ "Email inválido." |
| C | "Ese email no parece correcto." |

---

## 12. Empty states

### Historial vacío (primera vez)

| # | Variante |
|---|---|
| A | "Sin escenas todavía. La primera se escribe hoy." |
| B | ★ "Tu historia todavía no empezó. Escribí tu primera decisión." |
| C | "El historial se llena con cada decisión." |

### Sin rituales pendientes (todos completos)

| # | Variante |
|---|---|
| A | "Día completo." |
| B | ★ "Rituales del día, completos." |
| C | "Todo registrado." |

### Sin pacto activo

| # | Variante |
|---|---|
| A | "Sin pacto esta semana." |
| B | ★ "Sin pacto activo. El domingo se firma uno nuevo." |
| C | "El pacto se renueva el domingo." |

### Boss bloqueado

| # | Variante |
|---|---|
| A | "El boss sigue ahí. La puerta sigue cerrada." |
| B | ★ "Boss bloqueado. Necesitás más poder." |
| C | "Todavía no. La puerta no se abre." |

### Esperando al compañero (post-invitación)

| # | Variante |
|---|---|
| A | "Tu compañero todavía no entró." |
| B | ★ "Esperando. El mundo nace cuando los dos confirmen." |
| C | "Falta la otra persona." |

### Sin decisión escrita hoy (no es tu turno)

| # | Variante |
|---|---|
| A | "Hoy no escribís. Leé lo que pasó." |
| B | ★ "Hoy decide [nombre]. Mañana te toca." |
| C | "Tu turno es mañana." |

### Sin escena de ayer (primer día)

| # | Variante |
|---|---|
| A | "Todavía no hay escena." |
| B | ★ "La primera escena se genera con tu primera decisión." |
| C | "Escribí tu primera decisión para que el mundo arranque." |

### Stats en 0 / iniciales

| # | Variante |
|---|---|
| A | "Los stats empiezan en 50. Cada ritual los mueve." |
| B | ★ "Punto de partida. Los rituales hacen el resto." |
| C | "Stats iniciales. Todo puede cambiar." |

---

## 13. Stats

### Nombres largos (tooltips o first-use)

| Stat | Nombre corto | Nombre largo |
|---|---|---|
| VIT | VIT | Vitalidad |
| STR | STR | Fuerza |
| INT | INT | Inteligencia |
| STA | STA | Stamina |
| Poder | Poder | Poder (derivado de stats + racha) |

### Formato de display

- Barra de stat: `VIT 85`
- Cambio post-ritual: `VIT +3`
- Poder: `Poder 72`
- Racha: `Racha 5d` o `5 días`

---

## Reglas de redacción — Quick Reference

1. Español rioplatense. Voseo siempre. "Decidís", no "decides".
2. Sin exclamaciones. La épica no grita.
3. Sin emojis en copy funcional.
4. Máximo 12 palabras por oración.
5. Botones: 1-3 palabras, imperativo. "Firmar", "Reintentar", "Invitar".
6. Sin diminutivos. Sin condescendencia.
7. Sin jerga de apps. Sin anglicismos innecesarios.
8. El fracaso se muestra, no se dice. La UI cambia, el texto no juzga.
9. La urgencia viene del mundo. "La niebla avanza", no "llevás 2 días sin registrar".
10. Sentence case siempre. "Sellar pacto", no "Sellar Pacto".
11. Terminología RPG del glosario. Verificar antes de escribir.
12. Straight quotes, no curly quotes.

---

## Checklist pre-integración

Para cada string antes de meterlo en código:

- [ ] ¿Tiene menos de 12 palabras?
- [ ] ¿Usa voseo?
- [ ] ¿Evita palabras prohibidas?
- [ ] ¿Suena a RPG, no a app de productividad?
- [ ] ¿El tono es serio sin ser solemne?
- [ ] ¿Leído en voz alta suena natural?
- [ ] ¿Cada palabra se ganó su lugar?
