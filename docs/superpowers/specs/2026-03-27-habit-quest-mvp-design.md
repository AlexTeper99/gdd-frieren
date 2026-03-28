# Habit Quest — MVP Design Spec

**Date:** 2026-03-27
**Goal:** MVP funcional para 2 usuarios reales (Alex + Daiana)
**Stack:** Next.js 16 + Drizzle + Neon + Vercel + AI SDK + Claude

---

## 1. Visión

Habit Quest es una app de tracking de hábitos para dos personas que escriben juntas una novela continua estilo Frieren. Los hábitos reales de los jugadores influyen en el tono y los eventos del mundo narrativo. No es gamificación cosmética — el mundo responde a quién sos realmente.

**Lo que ES:**
- Una novela colaborativa escrita entre 2 jugadores y una IA
- Un tracker de hábitos con consecuencias narrativas reales
- Una PWA que se usa desde el celular como app nativa

**Lo que NO ES (en el MVP):**
- No tiene 3D, imágenes ni video
- No tiene diseño estético (Daiana lo diseña después)
- No tiene boss semanal, bond scenes ni arcos mensuales
- No tiene stats (VIT/STA/INT/STR) — solo HP y rachas

---

## 2. Usuarios

Dos usuarios hardcodeados:
- `alexteper99@gmail.com`
- `daiana.goldberg@gmail.com`

Auth por credentials (ya implementado). Sin sistema de invitación.

---

## 3. Arquetipos

Puramente estéticos/narrativos. No afectan mecánicas ni sugieren rituales. Solo cambian cómo la IA narra el personaje.

| Arquetipo | Inspiración | Estética narrativa |
|---|---|---|
| **Paladín** | Himmel | Héroe, determinación, acción con propósito |
| **Mago** | Frieren | Sabiduría, contemplación, poder silencioso |
| **Guerrero** | Eisen | Fortaleza, resistencia, acción directa |
| **Sacerdote** | Heiter | Cuidado, fe, serenidad |

---

## 4. Onboarding (solo primera vez)

Una vez completado, no se vuelve a mostrar.

### Pantalla 1 — Login
- Email + password

### Pantalla 2 — Tu Personaje
- Elegir arquetipo (Paladín / Mago / Guerrero / Sacerdote)
- Nombre del personaje (texto libre)
- Identidad: "¿Quién querés ser a fin de año?" (texto libre)

### Pantalla 3 — Misión y Rituales
- Elegir categoría de misión (ej: Sueño, Alimentación, Movimiento, etc.)
- Rituales sugeridos por categoría (pre-seleccionados, checkboxes)
- Agregar ritual custom con **inputs separados**:
  - **Hábito** (texto libre)
  - **Días** (botones toggle: Lun/Mar/Mié/Jue/Vie/Sáb/Dom)
  - **Hora inicio** (time picker)
  - **Hora fin** (time picker)
  - **Lugar** (texto libre)
- Sin límite de rituales

### Pantalla 4 — Intro Narrativa
- La IA genera el prólogo del personaje en el mundo de Valdris
- Texto estilo Frieren: quién es, cómo llegó, qué busca
- Después de leer → va al home

---

## 5. Navegación Principal

Container/Presentational pattern. Daiana diseña después.

```
Home:
  → Cards de ambos personajes (nombre, arquetipo, HP)
  → [Rituales]      — ver/marcar rituales del día
  → [Historia]      — leer/escribir la novela (turnos alternados)
  → [Pacto]         — pacto semanal (resaltado los domingos)
  → [Mi Personaje]  — HP, rachas, identidad, heatmap, editar rituales
  → [Otro Jugador]  — HP, rachas, identidad, heatmap (solo lectura)
```

---

## 6. Rituales

### Template
Cada ritual tiene:
- **Descripción** — qué hago ("cocinar el desayuno")
- **Días** — qué días (lun/mar/mié/jue/vie/sáb/dom)
- **Hora inicio** — cuándo empieza la ventana
- **Hora fin** — cuándo termina la ventana
- **Lugar** — dónde ("en la cocina")

### Funcionamiento
- Push notification llega a la **hora inicio** del ritual
- El jugador tiene hasta las **23:59** para marcar ✓ (el rango horario es informativo, no deadline)
- Si termina el día sin marcar → cuenta como no cumplido

### Racha
- **Cada ritual tiene su propia racha** (días consecutivos cumplido)
- Si un día no se marca, esa racha vuelve a 0
- Las rachas de otros rituales no se afectan

---

## 7. HP (Puntos de Vida)

Un solo número global por usuario (0-100).

### Cálculo en tiempo real (server action al marcar ritual)
- Al marcar ritual como cumplido: **+5 HP** (o **+7** si racha ≥ 7) + racha +1
- HP nunca sube de 100
- Al terminar el día sin marcar un ritual: **-10 HP** + racha = 0 (cron diario a las 23:59 solo para penalizar no cumplidos)
- HP nunca baja de 0

### HP 0
Evento narrativo fuerte: el personaje "cae", algo concreto se pierde en el mundo. HP se resetea a 30 para que pueda recuperarse.

### Efecto en la narrativa
La IA recibe los HP + rachas de ambos jugadores y los interpreta libremente. No hay rangos predefinidos ni mapeo mecánico. Un solo principio: **el mundo es un espejo de quienes lo habitan.**

La IA lee los números y narra lo que siente que ese mundo haría con esas personas en ese momento. Sin categorías, sin fórmulas.

**Única excepción mecánica:** HP 0 = algo concreto se pierde en el mundo (NPC se va, zona cierra, recurso desaparece). HP se resetea a 30.

---

## 8. Historia — La Novela Compartida

### Concepto
Una novela continua sin cortes artificiales, escrita a 3 manos (jugador 1, jugador 2, IA). El tono Frieren emerge del HP y las rachas de los jugadores. No hay arcos mensuales, cierres forzados ni epílogos programados. La historia crece con su propio ritmo.

### Turnos alternados
Todos los días, incluyendo domingo:
```
Día 1 → Jugador 1 (Alex) escribe
Día 2 → Jugador 2 (Daiana) escribe
Día 3 → Jugador 1 (Alex) escribe
...alternando indefinidamente (basado en turno_numero par/impar)
```

### Flujo de un turno

La novela se escribe así: Persona 1 + IA + Persona 2 + IA + Persona 1 + IA...

**Cuando es tu turno:**
1. Abrís Historia → ves la entrada anterior (lo que escribió el otro jugador + la continuación que generó la IA)
2. Abajo hay un campo para escribir tu parte (no necesariamente una "decisión" — puede ser cómo tu personaje vive ese momento, qué hace, qué dice, qué siente)
3. Enviás → la IA toma tu texto + HP/rachas de ambos y genera la continuación (~5 min de lectura máximo)
4. Se guarda en story_entries con snapshot de ambos jugadores

**Cuando NO es tu turno:**
- Leés lo que escribió el otro + la continuación de la IA
- Mensaje "mañana es tu turno"
- Solo registrás rituales

**No hay generación previa de "contexto" por la IA.** El contexto es la entrada anterior. La IA solo genera después de que el jugador escribe.

### Si no escribís en tu turno
- El turno pasa al otro jugador al día siguiente
- No se genera nada — el otro jugador escribe cuando le toque y la IA continúa desde la última entrada
- No hay doble penalización (el HP ya bajó por rituales no cumplidos si corresponde)

### Si no hacés nada por varios días
- Tu HP baja por rituales no cumplidos, tus rachas se rompen
- Cuando volvés y escribís, la IA recibe tu HP bajo, rachas rotas, y el gap en el historial. Con esos datos, narra el mundo como corresponde — sin módulo especial

### Historial
- Crónicas: historial scrolleable de todas las entradas anteriores

---

## 9. Pacto Semanal

### Cuándo
Todos los domingos. Push notification + ícono resaltado en el home.

### Flujo
1. Cada jugador responde 4 preguntas por separado:
   - **Obstáculos** — ¿Qué puede hacer difícil cumplir los rituales esta semana?
   - **Plan** — ¿Cómo vas a manejar esos obstáculos?
   - **Apoyo mutuo** — ¿Cómo se van a sostener el uno al otro?
   - **Opcional** — ¿Algo extra que agregar esta semana?
2. Cuando los dos responden → botón "Firmar"
3. Cuando los dos firman → pacto sellado
4. Pacto visible toda la semana desde la pantalla Pacto

---

## 10. PWA y Push Notifications

### PWA
- `manifest.json` (nombre: "Habit Quest", ícono, tema oscuro)
- Service Worker para cache offline básico (app shell)
- "Agregar a pantalla de inicio" en móvil → se abre fullscreen

### Push Notifications
- Al completar onboarding: pedir permiso de notificaciones
- **Rituales:** push a la hora inicio de cada ritual, según sus días configurados
- **Domingo:** push extra para completar el pacto semanal
- **Turno narrativo:** push si es tu turno y no escribiste

### Implementación
- VAPID keys en env vars
- `web-push` (npm) para enviar push desde el server
- **Vercel Cron Job** diario a las 00:01: lee todos los rituales del día
- **Vercel Queues** con delayed delivery: encola cada push a la hora exacta del ritual
- Costo estimado: ~300 operaciones/mes → $0

---

## 11. Modelo de Datos

```sql
users
  id              — uuid PK
  email           — text unique
  password_hash   — text
  nombre_personaje — text
  arquetipo       — enum (paladin, mago, guerrero, sacerdote)
  identidad_texto — text ("quién quiero ser")
  mision_categoria — text ("sueño", "alimentación", etc.)
  hp              — integer (0-100, default 100)
  onboarding_completed — boolean (default false)
  created_at      — timestamp

rituals
  id              — uuid PK
  user_id         — uuid FK → users
  descripcion     — text ("cocinar el desayuno")
  dias            — text[] (["lun","mar","mie","jue","vie"])
  hora_inicio     — time
  hora_fin        — time
  lugar           — text
  racha           — integer (default 0)
  activo          — boolean (default true)
  created_at      — timestamp

ritual_logs
  id              — uuid PK
  ritual_id       — uuid FK → rituals
  user_id         — uuid FK → users
  fecha           — date
  cumplido        — boolean

story_entries
  id              — uuid PK
  user_id         — uuid FK → users (quién escribió)
  fecha           — date
  turno_numero    — integer (orden cronológico)
  texto_jugador   — text (lo que escribió el jugador)
  texto_ia        — text (lo que generó la IA)
  snapshot_j1     — jsonb ({hp, rituales: [{nombre, racha}...]})
  snapshot_j2     — jsonb ({hp, rituales: [{nombre, racha}...]})
  created_at      — timestamp

pacts
  id              — uuid PK
  semana          — date (fecha del domingo)
  respuestas_j1   — jsonb ({obstaculos, plan, apoyo, opcional})
  respuestas_j2   — jsonb ({obstaculos, plan, apoyo, opcional})
  firmado_j1      — boolean (default false)
  firmado_j2      — boolean (default false)
  created_at      — timestamp

push_subscriptions
  id              — uuid PK
  user_id         — uuid FK → users
  subscription_json — jsonb (endpoint + keys del browser)
  created_at      — timestamp

story_memory (una fila activa, se actualiza después de cada story_entry)
  id              — uuid PK
  resumen         — text (resumen recursivo, ~20 oraciones max)
  world_state     — jsonb ({npcs, zonas, hilos_abiertos, hechos_inmutables})
  updated_at_entry — integer (turno_numero de la última entrada procesada)
  created_at      — timestamp
```

---

## 12. Integración con IA

### Stack
- AI SDK + Claude (ya instalados)
- System prompt composable: base + módulo por trigger

### Triggers

| Trigger | Cuándo | Qué genera |
|---|---|---|
| `prologo` | Onboarding paso 4 | Intro del personaje en Valdris |
| `diario` | Después de que el jugador escribe su parte | Continuación de la novela (~5 min lectura) |

Solo 2 módulos. El módulo `diario` cubre todo: días normales, días malos, y regresos después de ausencia. La IA recibe HP + rachas + historial y tiene toda la información para interpretar el estado del mundo sin triggers especiales. Si un jugador vuelve después de días sin escribir, la IA lo ve en el HP bajo, rachas rotas, y el gap en el historial.

### Memoria narrativa — cómo la IA recuerda la historia

Claude no tiene memoria entre llamadas. Cada llamada es desde cero. La continuidad se logra con **inyección estructurada** de contexto curado (~20K tokens por llamada):

```
Lo que recibe Claude en cada llamada:

1. SYSTEM PROMPT (~3K tokens)
   → Tono, reglas, inspiración Frieren

2. RESUMEN RECURSIVO (~2K tokens)
   → "Toda la historia hasta ahora" en ~20 oraciones
   → Personajes que aparecieron, decisiones clave,
     qué pasó en el mundo, hilos abiertos
   → Se actualiza después de CADA entrada con una segunda
     llamada a Claude: "resumen anterior + entrada nueva
     → generá resumen actualizado"

3. WORLD STATE — JSON estructurado (~1K tokens)
   → npcs: [{nombre, relación, estado, última aparición}]
   → zonas: [{nombre, estado, descubierta cuándo}]
   → hilos_abiertos: ["el herbolario desapareció", ...]
   → hechos_inmutables: ["el paso norte está cerrado", ...]
   → Se actualiza junto con el resumen

4. ENTRADAS RECIENTES — últimas 5 completas (~6K tokens)
   → Texto íntegro para continuidad de voz y tono

5. ESTADO ACTUAL — JSON (~500 tokens)
   → HP + rachas de ambos jugadores

6. TEXTO DEL JUGADOR
   → Lo que escribió
```

**Flujo de memoria después de cada entrada:**
1. El jugador escribe → Claude genera continuación (~1000 palabras)
2. Se guarda en story_entries con snapshot
3. Segunda llamada a Claude (barata): "acá tenés el resumen anterior + la entrada nueva + el world state anterior → generá resumen y world state actualizados"
4. Se guarda en story_memory

**Por qué no mandar toda la historia raw:**
- "Context rot": más tokens = peor razonamiento sobre lo que importa
- Curado y estructurado > crudo y largo (validado por AI Dungeon, NovelAI, Anthropic)
- ~20K tokens por request es el sweet spot: rápido, barato, alta calidad

**Costo estimado:** ~$0.12 por entrada (generación + actualización de memoria). ~$3.60/mes.

### Contexto de ejemplo que recibe la IA

```json
{
  "trigger": "diario",
  "jugador_activo": {
    "nombre": "Kael",
    "arquetipo": "mago",
    "identidad": "Alguien que cuida lo que come",
    "hp": 82,
    "rituales": [
      {"nombre": "cocinar desayuno", "racha": 15},
      {"nombre": "dormir antes de las 23", "racha": 3},
      {"nombre": "caminar 30 min", "racha": 0}
    ]
  },
  "otro_jugador": {
    "nombre": "Lyra",
    "arquetipo": "sacerdote",
    "identidad": "Alguien presente y en calma",
    "hp": 65,
    "rituales": [
      {"nombre": "meditar 10 min", "racha": 20},
      {"nombre": "no celular en la cama", "racha": 1}
    ]
  },
  "texto_jugador": "Kael se sentó junto al fuego...",
  "resumen": "Kael y Lyra llevan dos semanas viajando al sur de Valdris...",
  "world_state": {
    "npcs": [{"nombre": "El herbolario", "estado": "desaparecido", "ultima_aparicion": 8}],
    "zonas": [{"nombre": "Paso Norte", "estado": "cerrado"}],
    "hilos_abiertos": ["las marcas en la cueva que Lyra encontró"],
    "hechos_inmutables": ["el paso norte se cerró la noche que Kael cayó"]
  },
  "entradas_recientes": ["(últimas 5 entradas completas)"]
}
```

---

## 13. System Prompt — Nuevo desde cero

> **NOTA:** Este es el prompt base. Se diseñará en detalle como tarea separada (task #6: research + optimización de narrativa con Claude). La estructura final incluirá iteración con outputs reales.

```xml
<identidad>
Sos el narrador de Habit Quest. Escribís una novela continua protagonizada por dos
personajes cuyas vidas reales alimentan la historia. No sos un game master. No presentás
opciones. No pedís decisiones. Escribís prosa narrativa como si fuera un capítulo de
Frieren: Beyond Journey's End.

Los dos jugadores escriben turnándose. Vos tomás lo que escribieron y tejés la
continuación. La historia es una sola, compartida, sin bifurcaciones. Cada entrada
arranca donde la dejó el otro.
</identidad>

<tono>
Internalizá estos principios. No los mencionás — los vivís:

1. CONTRASTE. Acción épica breve e intensa. Quietud lenta y significativa.
   El impacto viene del contraste entre ambos.

2. EL TIEMPO PESA. Los cambios se acumulan sin que nadie lo note.
   No hay un momento exacto donde algo cambió. A los 60 días de cocinar:
   "simplemente lo hace."

3. LO PEQUEÑO IMPORTA MÁS. El olor del campamento. El sonido del fuego.
   Cómo uno dobla el mapa mientras el otro mira las estrellas.
   Lo cotidiano sostenido es más heroico que cualquier batalla.

4. MELANCOLÍA SIN TRAGEDIA. Los días difíciles son parte del viaje.
   Los personajes los enfrentan con entereza. El mundo cambia,
   ellos siguen caminando.

5. VÍNCULOS EN SILENCIO. No hay declaraciones. Hay presencia.
   Un gesto. Un silencio compartido. Una taza de té ofrecida sin palabras.

6. EL VIAJE ES TODO. No hay destino final. No hay "ganar". La historia
   es el camino y lo que les pasa mientras caminan.
</tono>

<mundo>
El reino de Valdris. Un mundo de fantasía en tono bajo — no hay elegidos,
profecías ni espadas luminosas. Hay caminos, campamentos, pueblos, bosques,
montañas. Hay personas comunes haciendo cosas extraordinarias por sostenerlas
en el tiempo.

Los personajes viajan juntos. La historia es su viaje compartido.
</mundo>

<calibracion>
Recibís el HP (0-100) y las rachas de cada ritual de ambos jugadores.
No mencionás estos números jamás.

Un solo principio: el mundo es un espejo de quienes lo habitan.
Si alguien sostiene sus rituales, eso se siente en cómo se mueve,
en cómo reacciona el entorno, en lo que es posible.
Si alguien no los sostiene, el mundo lo acusa — no con castigo,
con realidad. Las cosas cuestan más. Algo falta sin que nadie
pueda señalar exactamente qué.

No uses categorías. No pienses "HP alto = X, HP bajo = Y".
Leé los números, leé las rachas, y escribí lo que sentís
que ese mundo haría con esas personas en ese momento.

HP 0 es el único evento mecánico: algo concreto se pierde.
Un NPC se fue. Una zona se cerró. Un recurso desapareció.
Los personajes siguen — pero el mundo acusa el golpe.

El mundo es uno solo para los dos. Si uno está bien y el otro no,
eso convive en la misma escena. No lo expliques — narralo.
</calibracion>

<inspiracion>
Tu inspiración artística es Frieren: Beyond Journey's End.
No como referencia superficial — como filosofía narrativa internalizada.

Recordá cómo Frieren narra:

- Himmel le regaló flores a Frieren durante 50 años. Ella no entendió
  por qué hasta que él murió. La escena del campo de flores al inicio
  del anime no es triste por lo que perdió — es triste por lo que no
  supo valorar mientras lo tenía. Esa es tu escala emocional.

- Eisen dice "tengo miedo" antes de cada pelea. El guerrero más fuerte
  del grupo tiene miedo siempre. Nadie lo juzga. Eso no lo hace débil —
  lo hace real. Así tratás la fragilidad de los personajes.

- Frieren pasa 80 años aprendiendo un hechizo para hacer flores
  porque a Himmel le gustaban. No es eficiente. No es lógico.
  Es lo más humano que hace en toda la serie. El esfuerzo sostenido
  en algo pequeño es tu definición de heroísmo.

- Los episodios de viaje son más importantes que las peleas.
  Comprar comida en un pueblo. Mirar las estrellas. Reparar una capa.
  Esos momentos construyen a los personajes más que cualquier batalla.
  Tu narrativa vive ahí.

- El tiempo pasa y deja marca. Frieren vuelve a lugares 50 años después
  y las personas cambiaron o ya no están. No hay drama — hay peso.
  El paso del tiempo en tu historia no se anuncia, se siente.

- Las peleas en Frieren duran segundos. Son técnicas, resolutivas,
  sin discursos. Si hay acción épica en tu historia, que sea así:
  breve, intensa, y después silencio.

- La relación entre Frieren y Fern no se declara. Se construye
  en gestos: Fern le cocina, Frieren le enseña magia sin que se lo
  pidan, comparten un paraguas sin hablar. Los vínculos en tu historia
  se construyen igual — en lo que hacen, no en lo que dicen.
</inspiracion>

<reglas>
SIEMPRE:
- Detalles sensoriales específicos (frío, niebla, luz, peso, textura)
- Referenciar momentos pasados de la historia de forma natural
- Español rioplatense (vos, usás, querés)
- Prosa narrativa pura — como un capítulo de novela
- Cada entrada arranca donde la dejó el otro jugador
- ~5 minutos de lectura por entrada (800-1200 palabras)
- Respetar el sabor del arquetipo en la narración:
  Paladín: determinación, propósito, acción con sentido
  Mago: contemplación, observación, poder silencioso
  Guerrero: fuerza directa, resistencia, pocas palabras
  Sacerdote: calma, cuidado, presencia sanadora

NUNCA:
- Mencionar HP, rachas, porcentajes, niveles, mecánicas o la app
- Juzgar moralmente al personaje
- Hacer que un día malo se sienta igual de bien que uno bueno
- Romper la cuarta pared
- Clichés: elegido, profecía, espada luminosa, destino escrito
- Terminar con moraleja, resumen o reflexión explícita
- Títulos, bullets, markdown o meta-texto
- Emojis
</reglas>
```

### Módulos por trigger

**prologo:**
```xml
<modulo_prologo>
Primera entrada de la historia. El jugador acaba de crear su personaje.
Presentá al personaje en Valdris: quién es, de dónde viene, por qué viaja.
Usá la identidad que escribió como semilla — no la cites textual, tejela
en la narrativa. Introducí al compañero de viaje si el otro jugador ya
completó onboarding. Si no, el personaje viaja solo por ahora.
6-8 párrafos. Terminá con el personaje llegando al campamento.
</modulo_prologo>
```

**diario:**
```xml
<modulo_diario>
Continuación de la novela. El jugador ya escribió su parte.

Tomá lo que escribió y tejé la continuación de la historia.
Lo que escribió es canon — lo que su personaje hizo, dijo o sintió.
Tu trabajo es llevar eso hacia adelante con el tono de Frieren.
El HP y las rachas de ambos jugadores tiñen el mundo, no la acción.
~800-1200 palabras (~5 minutos de lectura máximo).
Dejá la historia en un punto que invite al otro jugador a continuar mañana.
</modulo_diario>
```

Solo 2 módulos. No hay módulo de recovery ni de pacto.

El módulo `diario` cubre todos los escenarios: la IA lee el HP, las rachas y el historial, y escribe lo que corresponde. Si alguien vuelve después de una ausencia, los datos ya cuentan la historia — HP bajo, rachas rotas, gap en las entradas. La IA interpreta eso naturalmente sin instrucciones especiales.

El pacto semanal es un compromiso entre personas reales, no es parte de la novela.

---

## 14. Tech Stack

| Capa | Tecnología | Estado |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | ✅ configurado |
| ORM | Drizzle | ✅ configurado |
| Base de datos | Neon Postgres | ✅ configurado |
| Auth | Credentials (email + password) | ✅ implementado |
| IA | AI SDK + Claude | ✅ instalado |
| Deploy | Vercel | ✅ linkeado |
| Cron | Vercel Cron Jobs | por configurar |
| Queues | Vercel Queues | por habilitar |
| Push | web-push + VAPID keys | por implementar |
| PWA | manifest.json + Service Worker | por implementar |

### No se usa en MVP
- Generación de imágenes/video
- 3D / R3F / Three.js / GSAP
- Resend
- Bond scenes
- Boss semanal
- Arcos mensuales
- Stats (VIT/STA/INT/STR)

---

## 15. Pantallas — Detalle

> **Wireframe navegable:** `.superpowers/brainstorm/55407-1774666341/content/user-flow-final.html`
> Abrir con un servidor local para ver el flujo completo interactivo con todas las pantallas.

### Home
- Cards de ambos personajes arriba: nombre, arquetipo, HP de cada uno
- Fecha actual + indicador de turno
- Botones:
  - **Rituales** — con contador de completados del día
  - **Historia** — con indicador de turno
  - **Pacto** — resaltado los domingos con badge "DOM"
  - **Kael** (mi personaje) — acceso a mi perfil
  - **Lyra** (otro jugador) — acceso al perfil del otro

### Rituales
- Lista de rituales del día con rango horario y lugar
- Botón ✓ para marcar cumplido (server action → HP + racha se actualizan al instante)
- Racha visible por ritual
- Info: "+5 HP al marcar (+7 si racha ≥7), -10 HP si no se marca a las 23:59"

### Historia
- **Tu turno:**
  - Entrada anterior visible (lo que escribió el otro + continuación IA)
  - Campo de texto para escribir tu parte
  - Botón enviar → IA genera continuación (~5 min lectura)
- **No tu turno:**
  - Lo que escribió el otro + continuación de la IA
  - "Mañana es tu turno"
- Historial scrolleable de entradas anteriores (crónicas)

### Pacto
- **Domingo (sin completar):** 4 preguntas + campo de texto para cada una
- **Domingo (completado, esperando al otro):** tus respuestas + "esperando firma de [nombre]"
- **Sellado:** las respuestas de ambos + visual de pacto sellado
- **Entre semana:** pacto vigente visible (solo lectura)
- No es parte de la novela — es un compromiso entre personas reales

### Mi Personaje
- Nombre, arquetipo (con inspiración Frieren), identidad
- HP actual (barra visual)
- Racha de cada ritual
- Heatmap estilo GitHub del historial de rituales
- Botón "Editar rituales" → lleva a pantalla de ABM

### Otro Jugador
- Mismo layout que Mi Personaje pero **solo lectura**
- No se pueden editar los rituales del otro jugador
- Se ve: nombre, arquetipo, identidad, HP, rachas, heatmap

### Editar Rituales (ABM)
- Lista de rituales existentes con estado (activo/inactivo)
- Cada ritual tiene botones: Editar / Desactivar
- Formulario para agregar nuevo ritual con **inputs separados**:
  - **Hábito** (texto libre)
  - **Días** (botones toggle: Lun/Mar/Mié/Jue/Vie/Sáb/Dom)
  - **Hora inicio** (time picker)
  - **Hora fin** (time picker)
  - **Lugar** (texto libre)

---

## 16. Post-MVP (backlog)

En orden de prioridad tentativo:
1. Bond scenes (cuando ambos llevan 5+ días de racha)
2. Generación de imágenes para escenas narrativas
3. Diseño visual por Daiana
4. 3D campsite (si se decide retomar)
5. Video generation (Veo 3.1)
6. Sistema de invitación para nuevos jugadores
7. Más de 2 jugadores
