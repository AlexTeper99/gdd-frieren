# HABIT QUEST

## Game Design Document v4.2 — Documento Final Unificado

> *"Toda historia empieza con una decisión. Y toda decisión, sostenida en el tiempo, construye a quién sos."*

**Una historia compartida entre dos personas donde el crecimiento real construye el mundo.**

Inspirada en Frieren: Beyond Journey's End · Fundamentada en Atomic Habits
Claude API · Nano Banana · Veo 3.1 · Next.js · Para uso personal

---

## Índice

1. [El Problema Real](#01-el-problema-real)
2. [La Idea Central: Vivís un RPG Real](#02-la-idea-central-vivís-un-rpg-real)
3. [Identidad, Objetivo y Rituales](#03-identidad-objetivo-y-rituales)
4. [Los Rituales: Estructura Completa](#04-los-rituales-estructura-completa)
5. [El Pacto Semanal — Redefinido](#05-el-pacto-semanal--redefinido)
6. [El Sistema de Stats y Loop de Juego](#06-el-sistema-de-stats-y-loop-de-juego)
7. [La Mecánica de Escritura — D&D Reducido](#07-la-mecánica-de-escritura--dd-reducido)
8. [Consecuencias Narrativas Progresivas](#08-consecuencias-narrativas-progresivas)
9. [La Historia Colaborativa](#09-la-historia-colaborativa)
10. [El Tono Narrativo: Frieren](#10-el-tono-narrativo-frieren)
11. [Atomic Habits: Las 4 Leyes Aplicadas](#11-atomic-habits-las-4-leyes-aplicadas)
12. [UX/UI: El Flujo Completo](#12-uxui-el-flujo-completo)
13. [Stack Técnico y Arquitectura](#13-stack-técnico-y-arquitectura)
14. [Roadmap de Desarrollo](#14-roadmap-de-desarrollo)
15. [Ideas Futuras](#15-ideas-futuras)

---

## 01. El Problema Real

La mayoría de las apps de hábitos fallan porque la gamificación es **cosmética**. Badges, streaks y puntos sin consecuencias reales. Sin tensión. Sin pérdida. Sin historia. Son sistemas que hacen sentir bien usar la app, no sistemas que cambian comportamientos.

> **La pregunta central: ¿cómo hacer que sea más doloroso NO usar la app que usarla?**

### Lo que los mejores sistemas hacen que los demás no

| Sistema | Por qué funciona |
|---|---|
| **Duolingo** | Su arma real no es el streak sino la degradación de ligas y el streak freeze. La pérdida duele más que la ganancia satisface. Loss aversion (Kahneman). Si no actuás, bajás de liga. |
| **Dark Souls** | El fracaso tiene peso real. Perdés progreso concreto. Cada victoria vale porque costó algo. La tensión viene de que hay consecuencias genuinas al fallar. |
| **Habitica** | Hábitos como misiones. HP que baja si no cumplís. Funciona, pero permite trampa fácil — marcar sin hacer. Necesita fricción real. |
| **D&D** | El jugador tiene agencia real sobre la historia. Sus decisiones importan. El resultado no está predefinido. La imprevisibilidad genera inversión genuina. |
| **Atomic Habits** | Hacer el mal hábito difícil y el bueno obvio. Diseñar el entorno y la señal. La identidad antes que el resultado. La app tiene que crear fricción activa contra el abandono. |

### El error de diseño que este proyecto evita

Hay un segundo error menos obvio: la narrativa que trata los días difíciles con tanta dignidad que fallar se siente igual de bien que cumplir. Si el día malo produce texto bello y poético sin consecuencia real, el sistema inconscientemente enseña que ceder está bien. Ese error estaba en versiones anteriores de este documento y fue corregido. La narrativa ahora tiene **consecuencias progresivas visibles** — sin juicio moral, pero con pérdida real.

---

## 02. La Idea Central: Vivís un RPG Real

Este proyecto es tres cosas a la vez, y las tres se refuerzan mutuamente:

**Una app de hábitos** fundamentada en Atomic Habits, con implementation intentions reales, identidad como motor, y consecuencias concretas cuando fallás.

**Una historia colaborativa** en el estilo narrativo de Frieren — acción épica y quietud contemplativa alternando, vínculos que se construyen en silencio, el tiempo como protagonista.

**Un RPG de escritura** donde cada día tomás una decisión que guía la historia, y tus hábitos reales son el "dado" que determina si esa decisión sale bien. No podés ser héroe épico si no estás creciendo de verdad.

> *"Tu personaje no crece porque escribiste algo épico en la app. Tu personaje crece porque vos creciste."*

La frase sigue siendo verdad — pero también podés escribir algo épico. Lo que cambia es que la épica está disponible solo para quien la merece.

### Los tres pilares

| Pilar | Qué es |
|---|---|
| **Identidad** | Elegís una clase/arquetipo. Esa identidad guía decisiones automáticas sin esfuerzo consciente. |
| **Stats mapeados** | Cada hábito alimenta una estadística real que decae si la ignorás. El mundo lo refleja. |
| **Escritura + Narrativa generativa** | Cada día escribís una decisión. La IA genera la consecuencia cruzando tu decisión con tus stats reales. Ni vos sabés cómo sale. |

### Los arquetipos disponibles

| Arquetipo | Esencia | Stats | Hábitos sugeridos |
|---|---|---|---|
| ⚔️ **Guerrero** | Construís con el cuerpo. Tu disciplina es física. | STR + VIT | Alimentación, ejercicio. |
| 🧙 **Mago** | Construís con la mente. Tu disciplina es mental. | INT + STA | Sueño, hidratación. |
| 🏹 **Ranger** | Construís en movimiento. Tu disciplina es adaptación. | Balance | Combinación flexible de todos. |
| 🌿 **Curandero** | Construís desde adentro. Tu disciplina es cuidado. | VIT + STA | Alimentación antiinflamatoria, descanso. |

Los rituales sugeridos por arquetipo se usan como **pre-fill en el onboarding** — no son obligatorios. El usuario puede editarlos libremente. **El arquetipo es solo narrativo y estético:** determina los rituales sugeridos, cómo la IA narra el personaje, y el look visual. No afecta las mecánicas de stats (no hay multiplicadores por clase).

---

## 03. Identidad, Objetivo y Rituales

Atomic Habits dice que el orden correcto es **identidad → objetivo → rituales**. La mayoría arranca por los resultados ("quiero bajar de peso"), define el proceso ("voy a hacer dieta"), y espera que la identidad venga sola. Clear dice que eso está al revés. El cambio duradero empieza por decidir quién querés ser.

> *"Primero decidís quién sos. Después el hábito es simplemente la evidencia de esa decisión."*

### La estructura correcta — tres capas distintas

**Identidad**
Quién decidís ser. Permanente, no negocia. Es el ancla de todo lo demás.
Ejemplo: *"Soy alguien que cuida cómo vive — lo que come, cómo se mueve."*

**Objetivo mensual**
El área de foco del arco actual. Un área, no varias. Cambia cada mes según el progreso.
Ejemplo: *"Este mes me enfoco en alimentación."*

**Rituales**
Las acciones concretas con hora y lugar que sirven ese objetivo. Pueden ser varias siempre que todas apunten al mismo objetivo.
Ejemplo: preparar desayuno 7:30am, llevar almuerzo el domingo a la noche, no comprar procesados.

### Por qué múltiples rituales bajo un objetivo no es lo mismo que múltiples hábitos

La distinción crítica es si los rituales compiten por identidades distintas o sirven a la misma. Tres rituales que todos sirven a "alimentarme mejor" apuntan en una sola dirección. El esfuerzo cognitivo no se divide — se concentra. Si un día fallás el almuerzo pero hiciste el desayuno, seguís votando por la misma identidad. Un voto menos, no un frente colapsado.

En cambio, alimentación + entrenamiento + sueño en el mismo arco son tres identidades distintas con señales distintas, entornos distintos, fricción distinta. El esfuerzo cognitivo se divide y ninguna llega a la automaticidad.

### Cuándo agregar un segundo objetivo

Un segundo objetivo mensual se agrega cuando el primero llegó a la **automaticidad** — cuando lo hacés sin pensar, sin fricción consciente. Eso tarda entre 60 y 90 días. En la app: el cierre del segundo arco mensual es el momento donde el sistema pregunta si querés sumar algo nuevo. No antes. La historia lo refleja: el personaje creció lo suficiente para cargar con más.

---

## 04. Los Rituales: Estructura Completa

Atomic Habits llama a esto **implementation intention**. La fórmula exacta es:

> *"Voy a [RITUAL] a las [HORA] en [LUGAR]."*

Sin hora y lugar, el ritual queda flotando — siempre "más tarde", siempre "cuando pueda". La especificidad multiplica drásticamente la probabilidad de ejecución.

### La fórmula completa de cada ritual

| Campo | Descripción |
|---|---|
| **Qué** | El ritual concreto. No "comer mejor" — "preparar mi propio desayuno". |
| **Cuándo** | Hora específica. La notificación llega exactamente en ese momento. |
| **Dónde** | Lugar específico. Activa la señal ambiental que dispara el hábito. |
| **Si no puedo** | El contingency planning de Clear. "Si el miércoles tengo reunión a las 7am, lo hago a las 6:45 o en el hotel con lo que haya." El objetivo no baja — la implementación se adapta. |

### Ejemplo real — objetivo: alimentarme mejor

```
Identidad: "Soy alguien que cuida lo que come."

Objetivo del arco 1: Alimentación.

Rituales:
  Preparar mi desayuno. Lunes a viernes, 7:30am, mi cocina.
  Llevar almuerzo preparado. Domingo noche, 9pm, mi cocina.
  Si no pude preparar: elegir bien cuando como afuera — no delivery procesado.

Contingency para días de viaje o reunión temprana:
  Desayuno simple en hotel, pero real. El hábito no se rompe — se adapta.
```

### Ejemplo real — objetivo: moverme consistentemente

```
Identidad: "Soy alguien que cuida su cuerpo."

Objetivo del arco 2 (después de 60+ días con alimentación): Movimiento.

Rituales:
  Entrenamiento. Martes y jueves, 7pm, gimnasio.
  Movimiento outdoor. Sábado, 9am, parque.
  Si no pude ir al gym: 20 minutos donde sea. Día de marcha, no de rendición.
```

### Por qué el contingency planning es parte del hábito, no una excusa

Clear lo dice explícitamente: el mayor predictor de si alguien mantiene un hábito no es la motivación sino si pensó de antemano en qué puede salir mal y cómo lo va a manejar. El contingency no baja el objetivo — lo protege. Es la diferencia entre "fallé" y "lo adapté". La identidad permanece intacta. La implementación fue flexible.

---

## 05. El Pacto Semanal — Redefinido

Había una confusión de diseño que se corrige acá: el pacto semanal **NO** es una versión reducida del hábito. No da permiso para ceder. No toca el objetivo ni los rituales. Son dos capas completamente distintas.

> **El objetivo no negocia. Los rituales se adaptan. El pacto planifica los obstáculos.**

### Qué responde cada capa

| Capa | Qué responde |
|---|---|
| **El hábito** | Quién querés ser y qué vas a hacer concretamente. Fijo. No negocia. Definido en el onboarding con hora, lugar y contingencia. |
| **El pacto semanal** | No toca el hábito. Responde: qué tiene esta semana que puede dificultar los rituales, cómo se planifican esos obstáculos, y cómo los dos se sostienen mutuamente en ese contexto específico. |
| **Los rituales** | Se registran individualmente con un tap a lo largo del día, disparados por notificaciones a la hora exacta que definiste. 2 segundos cada uno. Alimentan los stats directamente. |
| **La decisión narrativa** | Una vez al día, cuando quieras. La IA presenta la situación, escribís 1-2 oraciones. Bien/Regular/Difícil se calcula automáticamente de los rituales registrados — pero es invisible al usuario. |

### Cómo evoluciona el pacto semana a semana

**Semana 1 — contexto normal:**

> *"No hay nada especial esta semana. Mantenemos el ritual. Lyra se asegura de no despertarme tarde el martes."*

**Semana 3 — semana difícil:**

> *"El miércoles tengo reunión a las 7am y el jueves viajo. Esos días el desayuno es a las 6:45 o en el hotel. El hábito no se rompe — se adapta. Lyra me manda mensaje el jueves a la mañana."*

**Semana 7 — racha buena, suman algo:**

> *"Los dos estamos bien. Esta semana agregamos: ninguno come solo si el otro está en casa."*

**Semana 10 — semana de mucho trabajo:**

> *"Esta semana es de supervivencia. Prioridad: no saltear el desayuno. Todo lo demás es bonus. No nos juzgamos si el almuerzo falla."*

### Las cuatro preguntas del pacto

1. **Obstáculos** — ¿Qué tiene esta semana que puede dificultar los rituales?
2. **Plan** — ¿Cómo cada uno maneja esos obstáculos concretos?
3. **Apoyo mutuo** — ¿Cómo se sostienen entre sí durante esa semana específica?
4. **Opcional** — ¿Quieren sumar algo pequeño esta semana sobre el hábito base?

> El pacto no da permiso para fallar. El pacto prepara el terreno para no fallar.

---

## 06. El Sistema de Stats y Loop de Juego

### Los cuatro stats primarios + Poder

Cada ritual alimenta un stat **primario** (boost grande) y stats **secundarios** (boost chico). Cocinar no solo sube VIT — también sube INT un poco (planificaste, te organizaste). Esto hace que todos los stats se muevan desde el día 1.

| Stat | Área | Rituales que lo alimentan |
|---|---|---|
| 💚 **VIT — Vitalidad** | Alimentación | Cocinar comida real, comer con intención, no saltear comidas. |
| 💧 **STA — Stamina** | Hidratación | Vasos de agua diarios, evitar bebidas azucaradas. |
| 🧠 **INT — Inteligencia** | Sueño | Horas dormidas, horario consistente, rutina nocturna. |
| 💪 **STR — Fuerza** | Movimiento | Ejercicio, caminata, actividad física de cualquier tipo. |

**Poder** es un stat derivado que no se alimenta directamente con ningún ritual. Se calcula del promedio de los 4 stats primarios + la racha. Representa el nivel general del personaje — qué tan listo está para lo que venga. La IA usa Poder para gatear los momentos épicos: Poder alto = épica disponible, Poder bajo = el mundo resiste.

### Racha como multiplicador global

La racha no es solo un contador. Cada día consecutivo con todos los rituales completos da un **boost pasivo a todos los stats**. Esto hace que la consistencia se sienta como progresión de personaje completa, no como llenar una barra individual.

### Decay rate — el mundo decae si no lo alimentás

| Tiempo sin registro | Efecto |
|---|---|
| 0-24h | Nada visible. El sistema toma nota internamente. |
| 24-48h | El stat empieza a bajar. La narrativa lo acusa sutilmente — una sombra, algo distinto en el aire. |
| 48-72h | Bajada más rápida. El decay es visible en la UI. La narrativa tiene urgencia real. |
| 72h+ | Estado crítico. Algo concreto en el mundo se cierra o se oscurece. Un NPC desaparece. Una zona se bloquea. |

### El loop central

```
Rituales: tap ✓ a lo largo del día (2 seg cada uno)
        ↓
Stats suben con cada ritual registrado
        ↓
Decisión narrativa: cuando quieras, escribís 1-2 oraciones
        ↓
IA cruza decisión con stats actuales
        ↓
Genera consecuencia narrativa calibrada
        ↓
El mundo avanza o se complica
```

### La estructura de misiones

| Tipo | Descripción |
|---|---|
| **Rituales** | Tap ✓ individual por cada ritual, disparado por notificación a la hora exacta. 2 segundos. Alimenta stats directamente. |
| **Daily Quest** | Escribís tu decisión del día cuando quieras. La IA cruza con los stats (alimentados por los rituales). Los turnos de escritura alternan entre los dos jugadores. El nivel del día se calcula internamente de los rituales — invisible al usuario. |
| **Weekly Close** | Cierre narrativo de la semana. Siempre disponible el domingo. Incluye el ritual del pacto y, si corresponde, la escena de vínculo. El domingo pasa sí o sí — el loop social no se bloquea. |
| **Weekly Boss** | El boss fight del domingo. **Siempre disponible** — el boss se enfrenta todas las semanas. Los dos escriben su decisión **por separado, sin ver la del otro**. La IA fusiona las decisiones y cruza con los stats combinados de los 7 días. El resultado varía según los stats: épica si están verdes, victoria con costo si regulares, derrota narrativa con consecuencias si bajos. No es binario ganar/perder — es un espectro. |
| **Monthly Arc** | La historia del mes. Resolución determinada por quién fuiste durante los 28-30 días y las decisiones escritas. Ni vos sabés el final. |

### Cómo interactúan Weekly Close y Weekly Boss

El domingo siempre tiene los tres momentos: cierre narrativo, boss, y pacto. Lo que cambia es el tono y el resultado del boss según los stats de la semana.

**Buena semana (stats en verde):**
Weekly Close celebra el progreso. Weekly Boss: épica disponible, las decisiones arriesgadas pueden salir bien. Posible escena de vínculo si ambos tienen 5+ días de racha.

**Semana regular:**
Weekly Close con tono neutro. Weekly Boss: el enfrentamiento es más difícil, las decisiones conservadoras funcionan pero las arriesgadas tienen costo. Se pasa, pero queda marca.

**Mala semana:**
Weekly Close con consecuencias visibles. Weekly Boss: derrota narrativa. Algo concreto se pierde — un NPC, una zona, un recurso. Las consecuencias se arrastran a la semana siguiente. El personaje enfrenta la derrota con dignidad, no con vergüenza.

> La consecuencia es real. El domingo siempre es significativo. El loop social nunca se bloquea.

---

## 07. La Mecánica de Escritura — D&D Reducido

### La idea central

En D&D original, el dado determina si tu acción sale bien. Es azar puro. Podés ser el personaje más débil y tirar un 20 y matar al dragón.

En este sistema, **tus hábitos reales son el dado**. No es azar — es consecuencia directa de quién estás siendo.

```
D&D original:
Declarás acción → Tirás dado → Resultado

Habit Quest:
Escribís tu decisión → Tus stats/racha/hábitos son el dado → Resultado
```

Esto es más poderoso que D&D porque el dado no lo podés mentir. Tus hábitos tampoco.

### Las dos interacciones del día — ritmos distintos

**Los rituales se registran por separado, con un tap, a lo largo del día.** Cada ritual tiene su hora y su notificación. Cuando llega, abrís la app, tocás ✓, cerrás. 2 segundos. Cada tap alimenta los stats directamente.

**La decisión narrativa se escribe una vez al día, cuando quieras.** No está atada a una hora ni a que hayas completado los rituales. Podés escribir a la mañana, al mediodía o a la noche. Los rituales que ya registraste cuentan para los stats al momento de generar la consecuencia. Los que registres después también suman.

El nivel del día (Bien / Regular / Difícil) se **calcula internamente** de los rituales registrados. **No se muestra al usuario** — es solo un input para la IA.

### El loop de escritura

**Paso 1 — La IA presenta la situación** (máximo 3 líneas)

> *"El camino hacia la torre se divide en dos. El sendero de la izquierda es más corto pero cruza el bosque donde los espíritus del hambre confunden la mente de los viajeros débiles. El de la derecha rodea la montaña — tres días más de marcha. ¿Qué decide Kael?"*

**Paso 2 — Escribís tu decisión** (1-2 oraciones, no más)

> *"Kael toma el camino de la izquierda. Confía en que está listo."*

**Paso 3 — La IA cruza tu decisión con tus stats (alimentados por los rituales) y genera la consecuencia**

La escritura toma menos de 1 minuto. Los rituales se registraron por separado a lo largo del día.

### Cómo los stats determinan el resultado

La IA recibe tu decisión y tu estado real:

```
Decisión: "Kael toma el camino peligroso"

Estado actual:
VIT  85%  → alimentación excelente esta semana
STR  40%  → sin ejercicio en 4 días
Streak: 6 días ✓
Racha combinada con Lyra: 4 días ✓
```

VIT alta le da claridad mental para resistir los espíritus. STR baja hace el camino físicamente más duro. El resultado es matizado y honesto:

> *"El bosque los recibió en silencio. Los espíritus del hambre estaban ahí — Kael los sintió rozar su mente, buscando un hueco. No encontraron hambre real. La semana había sido buena en ese sentido. Pero las piernas pesaban más de lo esperado en el tercer kilómetro. Llegaron al otro lado. Más lentos de lo que Kael hubiera querido admitir."*

Llegaron — la decisión se cumplió. Pero el costo fue real porque STR estaba baja. Si STR hubiera estado alta también, habrían llegado rápido y frescos. Si VIT hubiera estado baja, los espíritus los habrían confundido y habrían tenido que retroceder.

**Tu escritura guía la dirección. Tus hábitos determinan cómo sale.**

### La escala de resultados según stats

No es binario éxito/fracaso. Es un espectro de cinco niveles:

| Situación | Resultado |
|---|---|
| **Stats altos + buena decisión** | Sale bien, con detalle épico. El momento que querías. |
| **Stats altos + decisión arriesgada** | Sale bien pero con un costo real. El triunfo tiene precio. |
| **Stats regulares + buena decisión** | Sale, pero más difícil de lo esperado. Llegaron, pero exhaustos. |
| **Stats bajos + decisión arriesgada** | Falla parcialmente. Consecuencias que se arrastran a los próximos días. |
| **Stats críticos + cualquier decisión** | El mundo resiste. El personaje lucha. La épica no está disponible todavía. |

Podés intentar ser héroe épico siempre. La escritura es libre. El universo responde según quién estás siendo realmente.

### Los tres tipos de situación diaria

**Días normales — decisiones cotidianas**
La situación es de bajo peso narrativo. Tu escritura guía el tono pero no tiene consecuencias mayores. El camino sigue. Pasan cosas interesantes pero no bifurcaciones importantes.

**Días de decisión — bifurcaciones del arco**
Marcados narrativamente como momentos importantes. Lo que escribís acá define el arco de la semana siguiente. La IA lo señala explícitamente:

> *"Esta noche, Kael llega a un punto sin retorno. Lo que decida aquí cambiará el camino del arco."*

**Boss semanal — el cierre de cada semana**
El domingo, antes del ritual del pacto. La situación más elaborada de la semana. Tu escritura + tus stats acumulados de los 7 días determinan cómo termina el arco semanal. No es una situación diaria — es el clímax de la semana.

**Resolución de arco mensual — la decisión más importante**
Una sola situación, generada el último domingo del mes. Una sola respuesta. El resultado depende de quién fuiste durante los 28 días anteriores. La épica no se decide ese día — se construyó con cada hábito del mes. Eso es Frieren en su forma más pura.

### El co-op en la mecánica de escritura — turnos alternados

La historia es **una sola voz** que se construye en turnos. Un día decide Kael, al día siguiente decide Lyra. La IA narra desde el personaje activo pero el mundo es compartido y continuo. No hay bifurcación — hay una sola historia construida en capas.

```
Lunes     → Kael escribe la decisión del día
Martes    → Lyra escribe la decisión del día
Miércoles → Kael escribe la decisión del día
...y así
```

**Cuando es tu turno:**
- Registrás tus rituales con tap a lo largo del día (cada uno a su hora)
- Cuando quieras: la IA presenta la situación desde donde la dejó el otro ayer
- Escribís tu decisión (1-2 oraciones)
- La IA genera la consecuencia cruzando tu decisión con tus stats

**Cuando no es tu turno:**
- Registrás tus rituales con tap igual — el registro es diario para los dos
- Abrís la app y leés la escena del otro — lo que decidió y cómo salió
- No hay situación para escribir ese día

Esto crea algo que no existía antes: **cada uno lee la decisión del otro**. Cuando abrís la app y ves lo que ella decidió, estás entrando al mismo mundo desde donde ella lo dejó. Es colaboración genuina — una sola historia construida en capas, un día cada uno.

El registro de rituales sigue siendo diario para los dos, independiente de los turnos de escritura.

### El boss semanal — cada uno propone, la historia elige

El boss fight del domingo es el único momento donde los dos escriben el mismo día. Cada uno escribe su decisión **por separado, sin ver la del otro**. La IA las recibe y aplica una de tres lógicas según lo que encuentra:

**Si las decisiones son compatibles** → las fusiona en una sola acción narrativa coherente.
> *"Kael quería entrar por el frente. Lyra quería flanquear por la izquierda. Sin coordinarlo, cada uno tomó su camino — y el resultado fue una trampa perfecta para el guardián."*

**Si las decisiones son contradictorias** → elige la que tiene más respaldo de stats combinados de la semana. La otra aparece como la tensión que existió antes de la acción.
> *"Kael quería esperar. Lyra quería atacar. Los stats de la semana hablaron por ella — había entrenado más, descansado mejor. Kael cedió. Atacaron."*

**Si las decisiones son completamente opuestas** → narra el conflicto entre los personajes como parte de la historia. La tensión es el resultado. La resolución queda para la semana siguiente.
> *"No se pusieron de acuerdo esa noche. Kael miraba la entrada norte. Lyra miraba la sur. El guardián esperaba adentro. Esa tensión entre ellos era, quizás, el verdadero boss de la semana."*

El resultado del boss depende de los stats combinados de ambos durante los 7 días. La escritura guía la dirección. Los hábitos de la semana determinan si ganan, pierden o quedan en empate narrativo.

---

## 08. Consecuencias Narrativas Progresivas

Esta es la corrección más importante respecto a versiones anteriores. La narrativa no puede tratar los días difíciles con tanta dignidad poética que fallar se sienta igual de bien que cumplir. Si el día malo produce texto bello sin consecuencia real, el sistema enseña inconscientemente que ceder está bien.

> **El sistema no juzga la identidad del personaje. Pero el mundo se deteriora visiblemente cuando fallás.**

### La distinción crítica: consecuencia vs juicio moral

**Juicio moral — NUNCA:**
La narrativa nunca dice "sos débil", "fallaste como persona", "decepcionaste". Eso es lo que Atomic Habits prohíbe — la vergüenza personal paraliza en vez de motivar.

**Consecuencia narrativa — SIEMPRE:**
El mundo acusa el golpe. Algo visible cambia. Una zona se oscurece, un NPC desaparece, el camino se complica. No es estético — es pérdida real.

**Dignidad del personaje — SIEMPRE:**
El personaje enfrenta la consecuencia con entereza. No es patético ni destruido. La dignidad está en cómo responde a la pérdida, no en la ausencia de pérdida.

### La escala de consecuencias

| Situación | Efecto narrativo | Efecto en escritura |
|---|---|---|
| **1 día malo** | Niebla que vuelve. Un NPC que no aparece. El camino más pesado. Urgencia suave. | Tus decisiones escritas tienen un costo leve aunque sean buenas. |
| **2 días seguidos** | Consecuencia visible y concreta. Un aliado se preocupa. Urgencia dramática real. | Las decisiones arriesgadas empiezan a fallar parcialmente. |
| **3 días o más** | Algo concreto se pierde. Una zona se cierra. Un NPC se distancia. El arco se complica. | Solo las decisiones más seguras y conservadoras salen bien. La épica no está disponible. |
| **Recuperación** | Gradual, no instantánea. El personaje tiene que ganarse de vuelta lo que perdió. La reconstrucción lleva días. | Los stats vuelven a subir, los resultados mejoran progresivamente. |

### El tono correcto — tres ejemplos

**Lo que el sistema NO hace — bonito, inútil:**

> *"Kael comió lo que había en el camino. No como un fracaso — como una deuda pendiente consigo mismo. El viaje continúa."*

Nada cambia. El mundo sigue igual. No duele nada.

**Lo que el sistema SÍ hace — consecuencia sin juicio, con dignidad del personaje:**

> *"La niebla volvió esa noche sobre Valdris. Kael lo notó en el frío — distinto al de otras noches. No se detuvo — ajustó la capa y siguió caminando. Pero el herbolario había cerrado el puesto antes de que anocheciera. Algo en el reino se estaba apretando. Si mañana tampoco, el paso del norte podría cerrarse antes de que llegaran."*

No dice que fallaste. No te llama débil. El personaje sigue en pie, con entereza. Pero el mundo cambió. El herbolario cerró. Hay urgencia real sobre lo que viene. Eso duele. Y tiene que doler.

---

## 09. La Historia Colaborativa

El habit contract de Atomic Habits dice que hacer públicos tus compromisos con otra persona es uno de los mecanismos de cambio más poderosos. Pero hay algo más profundo: **no querés fallarle a ella**. Eso es mucho más poderoso que cualquier streak o badge. Y los hábitos son contagiosos — la identidad del grupo se sostiene mejor que la individual.

La mecánica de turnos agrega otra dimensión: cuando llegás a tu día de decisión y leés lo que ella dejó ayer, querés estar en buena forma para que tu turno aporte algo real a la historia que construyeron juntos. No es presión — es responsabilidad narrativa compartida.

### La combinación: dos capas que no se interfieren

**Capa de Contrato — explícita, consciente, semanal**
Los dos se sientan el domingo, escriben su compromiso de la semana y firman. El pacto queda visible toda la semana. No toca el hábito — planifica obstáculos y define apoyo mutuo.

**Capa Narrativa — orgánica, invisible, continua**
El mundo reacciona al estado combinado de los dos. Las situaciones diarias los involucran a los dos. Los resultados de sus decisiones se cruzan. Nunca menciona stats ni pactos — solo narra.

### Cómo la narrativa refleja el estado combinado

Cada vez que la IA genera una escena, recibe el estado de los dos y sus decisiones escritas. Nunca menciona stats, porcentajes ni pactos. Solo narra.

**Los dos bien — decisiones complementarias:**

> *"Kael tomó el camino peligroso. Lyra rodeó la montaña. Se reunieron al anochecer del otro lado — él exhausto pero entero, ella con información que él no tenía. Juntos sabían más que separados."*

**Uno bien, uno regular:**

> *"Kael notó que Lyra caminaba más lento desde el mediodía. No dijo nada. Ajustó su paso. Esa noche armó el campamento mientras ella descansaba. Algunos días el equipo funciona así — uno sostiene mientras el otro recupera."*

**Los dos flojos:**

> *"La niebla volvió esa noche. Espesa, fría. La decisión que habían tomado en el cruce parecía menos clara ahora. No era el momento de rendirse — era el momento de recordar por qué habían empezado."*

### La escena de vínculo — el premio que no se pide

Cuando los dos tienen 5 días consecutivos cumpliendo sus rituales, esa noche la app no manda una notificación de logro. Solo:

> *"Esta noche, algo especial ocurrió en Valdris."*

Una escena más larga, más íntima. Un momento entre los dos personajes que no es sobre la misión — es sobre ellos. Construida por los dos con sus hábitos reales, sin que ninguno la planeara. Si el video ya se generó, llega un clip de 6-8 segundos que ilustra ese momento.

### Ejemplo de escena de vínculo

> *La noche cayó rápido en las montañas del norte.*
>
> *Kael terminó de apilar la leña mientras Lyra estudiaba el mapa a la luz del fuego. Ninguno habló por un rato. No hacía falta. Había un ritmo entre los dos que se había ido construyendo sin que ninguno lo planeara — él sabía cuándo ella necesitaba silencio, ella sabía cuándo él necesitaba moverse.*
>
> *"¿Cuánto falta?" preguntó Kael.*
>
> *"Dos días si el paso está despejado." Lyra dobló el mapa con cuidado. "Tres si no lo está."*
>
> *Kael asintió. Se sentó frente al fuego y miró las llamas un momento.*
>
> *"¿Te acordás por qué salimos?" dijo, sin mirarla.*
>
> *Lyra tardó en responder. "Me acuerdo."*
>
> *"Yo a veces lo pierdo de vista. En la marcha, en el frío, en los días malos." Hizo una pausa. "Pero después te miro y lo recuerdo."*
>
> *Lyra no dijo nada. Se acercó un poco más al fuego. O a él — era difícil saber.*
>
> *El fuego crepitó. Las montañas estaban quietas. Adentro de esa quietud, algo que habían construido juntos en los últimos días se sentía más sólido que la roca.*

### La pantalla compartida — Nosotros

```
Esta semana en Valdris...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kael     [========  ] 78%   streak 5d ✓
Lyra     [=====     ] 55%   streak 3d ✓

Pacto activo: "Ninguno de los dos saltea el desayuno.
El miércoles Lyra tiene reunión — lo hace antes."

Arco: La Torre Sellada — semana 2 de 4
Weekly Boss: desbloqueado ✓
Próxima escena de vínculo: en 2 días si ambos mantienen
```

No es un dashboard de control mutuo — es un mapa compartido del mundo que están construyendo juntos.

---

## 10. El Tono Narrativo: Frieren

La app no tiene opciones de tono. El estilo de Frieren está hardcodeado en el system prompt como principios narrativos internalizados — no como imitación, sino como forma de ver y narrar.

### Los principios narrativos de Frieren que aplica la app

**Acción épica Y quietud**
Frieren no es solo melancolía — tiene batallas que cortan el aliento. La clave es el contraste y la alternancia. La acción es más poderosa porque viene después de la quietud. La quietud es más emotiva porque sabés que estos personajes son capaces de cosas extraordinarias. La IA alterna libremente entre los dos modos. La mecánica de escritura amplifica esto: en días de stats altos, las decisiones épicas se resuelven con épica real.

**El tiempo tiene peso**
Los cambios se acumulan sin que el personaje lo note. Algo cambia, pero no hay un momento exacto en que cambió. A los 60 días: *"Kael ya no piensa en si va a cocinar. Simplemente lo hace. Eso cambió en algún momento sin que él lo notara."*

**Lo pequeño importa más**
Frieren recuerda que a Himmel le gustaban las flores. Eso es más poderoso que cualquier batalla final. Lo cotidiano sostenido es el verdadero logro. La IA narra el olor del campamento, la forma en que Lyra dobla el mapa, el silencio después de comer.

**Melancolía sin tragedia, con consecuencias**
Los días difíciles no son trágicos — son parte del camino. El personaje los enfrenta con dignidad. Pero el mundo cambia. La dignidad está en el tono del personaje, no en la ausencia de pérdida.

**Los vínculos en silencio**
Las escenas de vínculo no son declaraciones — son presencia compartida. Una conversación al fuego. Un gesto. Un silencio que dice más que las palabras.

**El viaje sobre el destino**
El arco del mes no es ganar. Es el recorrido. La resolución es casi secundaria a lo que pasó en el camino.

### El system prompt base — hardcodeado

```
"Narrá en el estilo de Frieren: Beyond Journey's End. Alternát entre momentos de acción
épica y quietud contemplativa — el contraste entre ambos es lo que hace que cada uno
impacte. Los combates son breves, intensos y resolutivos. Los momentos cotidianos son
lentos, detallados, cargados de significado. Los vínculos se construyen en silencio
y en pequeños gestos. El tiempo pasa y deja marca visible. Lo mundano sostenido es
más heroico que cualquier batalla.

Cuando el personaje escribe una decisión épica y sus stats lo respaldan, narrá con
toda la épica que merece. Cuando los stats no lo respaldan, narrá el esfuerzo real,
el costo, la dificultad — sin juicio moral, con consecuencias concretas. El mundo
responde a quién es el personaje realmente, no a quién quiere ser en la ficción."
```

### Los tres modos narrativos que la IA alterna

**Modo quieto — día cotidiano bueno:**

> *"Kael ya no piensa en si va a cocinar. Simplemente lo hace. Eso cambió en algún momento sin que él lo notara. Lyra lo observó desde lejos, sin decir nada. Había algo distinto en cómo se movía últimamente."*

**Modo acción — decisión épica con stats que la respaldan:**

> *"La criatura emergió del bosque antes del amanecer. Kael no dudó — el cuerpo respondió antes que la mente. Tres movimientos. Limpio. El camino siguió abierto. Ese tipo de días recordaba por qué habían empezado a entrenarse."*

**Modo consecuencia — decisión épica sin stats suficientes:**

> *"Kael eligió el camino corto. El bosque lo recibió con calma — pero sus piernas no respondieron como esperaba en el tercer kilómetro. Llegaron al otro lado. Más lentos de lo que quería admitir. La decisión había sido correcta. El cuerpo todavía no estaba del todo ahí."*

---

## 11. Atomic Habits: Las 4 Leyes Aplicadas

Cada principio del libro tiene un lugar en la app — no como feature explícita, sino como parte del diseño invisible.

### Ley 1 — Hacerlo obvio (la señal)

El hábito necesita una señal clara. Sin señal concreta el hábito queda flotando. Implementation intention: hora + lugar + acción.

**En la app:** El pacto semanal ES la implementation intention. Cuando escribís "preparo el desayuno a las 7:30 en mi cocina", la notificación llega exactamente en ese momento con texto contextualizado. No una alarma genérica — una señal específica.

### Ley 2 — Hacerlo atractivo (el anhelo)

El hábito tiene que generar anticipación antes de hacerlo. Temptation bundling: atás algo que querés a algo que necesitás.

**En la app:** La mecánica de escritura ES el temptation bundling. Querés registrar para escribir tu decisión del día y ver cómo sale. La escena de vínculo ES el anhelo de la racha de 5 días. La notificación "algo especial ocurrió" es anticipación pura. El Weekly Boss desbloqueándose es la zanahoria del final de semana.

### Ley 3 — Hacerlo fácil (la respuesta)

La fricción mata los hábitos. Regla de los dos minutos: el hábito tiene que poder empezar en dos minutos o menos. Contingency planning para los días difíciles.

**En la app:** Los rituales son un tap de 2 segundos cada uno — fricción casi nula. La decisión narrativa se escribe cuando quieras, sin horario fijo. La IA sugiere pactos más pequeños si el compromiso es demasiado ambicioso. El contingency planning está en la definición del ritual, no en el pacto. Nunca dos veces seguidas: un día malo no rompe el ritual — dos días sí empiezan a romperlo.

### Ley 4 — Hacerlo satisfactorio (la recompensa)

El cerebro repite lo que se siente bien inmediatamente. La recompensa real de los hábitos saludables es diferida — hay que crear satisfacción inmediata artificial hasta que la real se vuelva perceptible.

**En la app:** La narrativa generada es la recompensa inmediata — registrás, escribís tu decisión, y en segundos hay una consecuencia que se siente tuya. El pacto con tu novia es el contrato de hábitos más poderoso posible. El Weekly Boss desbloqueado y la escena de vínculo son las recompensas de la semana.

### Principios de largo plazo

**Valle de la decepción**
Semanas donde hacés todo bien y no notás cambio. La mayoría abandona acá. La narrativa de Frieren acompaña — como los tramos largos del camino donde nada parece pasar pero todo se está construyendo silenciosamente.

**Identidad > resultados**
Cada check-in es un voto por quién querés ser. El personaje es la proyección de esa identidad. La narrativa refuerza esto en cada escena.

**Automaticidad a 60-90 días**
El hábito deja de requerir esfuerzo consciente. La app lo reconoce narrativamente: *"Kael ya no piensa en si va a cocinar. Simplemente lo hace."* Ese es el hito más importante del sistema.

**Evitar el aburrimiento**
El enemigo de largo plazo no es la dificultad sino el aburrimiento. El hábito es repetitivo — la historia nunca lo es. Dos escenas iguales no existen en el sistema.

**Revisión periódica**
El cierre de arco mensual permite ajustar el hábito, cambiar el foco, agregar rituales nuevos. La historia escucha: *"El reino cambió este mes. ¿Qué querés que el próximo capítulo revele?"*

---

## 12. UX/UI: El Flujo Completo

> *"La app tiene que sentirse como abrir un libro, no como abrir una app."*

### Onboarding — El Origen (una vez, 3-5 minutos)

**Pantalla 0 — La llegada**
Pantalla negra. Texto que aparece solo, como si se escribiera: *"Toda historia empieza con una decisión."* Un solo botón. Sin logo todavía. Sin nombre de la app. Solo la pregunta.

**Pantalla 1 — El arquetipo**
Cuatro opciones con ilustración generada. Descripción de esencia, no de mecánicas. Se elige por resonancia — la selección pre-llena los rituales sugeridos en la pantalla 3. El arquetipo **no muestra stats** al usuario porque es solo narrativo y estético.

| Arquetipo | Esencia | Rituales sugeridos |
|---|---|---|
| ⚔️ Guerrero | Construís con el cuerpo. Tu disciplina es física. | Alimentación, ejercicio. |
| 🧙 Mago | Construís con la mente. Tu disciplina es mental. | Sueño, hidratación. |
| 🏹 Ranger | Construís en movimiento. Tu disciplina es adaptación. | Combinación flexible. |
| 🌿 Curandero | Construís desde adentro. Tu disciplina es cuidado. | Alimentación antiinflamatoria, descanso. |

**Pantalla 2 — Identidad y personaje**
Dos campos en una misma pantalla. Primero: *"¿Quién querés ser al final de este año?"* Campo libre. Sin sugerencias. Que lo piensen. La identidad se declara después del arquetipo para que la elección de esencia informe la declaración. Debajo: *"¿Cómo se llama tu personaje?"* Campo libre. *"No tiene que ser tu nombre real. Puede serlo."*

**Pantalla 3 — Misión del arco y rituales**
Arriba: en qué área querés enfocarte este primer mes. Sugerencias **pre-llenadas según el arquetipo elegido** + campo libre editable. La IA recibe texto libre. Abajo: hasta 3 rituales. Cada uno pide: qué, cuándo, dónde, y opcionalmente qué hacés si ese día no podés. Las sugerencias de ritual también se pre-llenan según arquetipo pero son 100% editables. Estos generan las notificaciones específicas.

**Pantalla 4 — Invitar**
Link o código para la otra persona. Ella hace su propio onboarding completo. Cuando los dos confirman, la IA genera el mundo compartido.

**Pantalla 5 — Generación del mundo**
15-20 segundos de loading narrativo. *"Nombrando el reino... Dando vida a los primeros habitantes... Escribiendo el primer capítulo..."* No es loading — es que algo está naciendo.

**Pantalla 6 — El prólogo**
Texto de 3-4 párrafos generado por IA. Primera imagen del mundo con Nano Banana. El personaje, el reino, la amenaza inicial, el arco del mes. Ni vos sabés cómo termina. Un botón: Comenzar.

---

### Pantalla principal — El Mundo como Campamento

El Mundo es un **campamento interactivo** — una escena visual con objetos tapeables que funcionan como navegación. No hay barra de navegación inferior ni dashboard. El campamento ES la interfaz, inspirado en DinoTaeng (en.dinotaeng.com). La atmósfera visual del campamento respira con el estado del mundo (amanecer/nublado/niebla/vínculo).

**Objetos del campamento:**

| Objeto | Visual | Función |
|---|---|---|
| **Fogata** | Fuego central con troncos y piedras | Registrar rituales diarios (tap ✓) |
| **Personaje** | Avatar con pose/arma de arquetipo | Ver identidad + stats + tracker de rituales (ficha de personaje) |
| **Crónicas** | Libro/tomo | Leer historia pasada (diario estilo periódico) + escribir decisión narrativa |
| **Pacto** | Pergamino enrollado con sello de lacre | Ver pacto semanal sellado / hacer ritual del domingo |
| **Frieren** | NPC sentada cerca del fuego | Aparece solo cuando hay decisión pendiente (tu turno o boss). Lleva a Crónicas para escribir. |

**Menú hamburguesa** (sutil, arriba izquierda): slide panel con acceso textual a todos los objetos + Nosotros + Configuración.

**Estados de Frieren:**
- Visible + notificación pulsante = hay decisión pendiente
- Transparente/ghost = no es tu turno, nada pendiente

**Señales del domingo:** Crónicas brilla (cierre listo) → Frieren aparece (boss) → Pacto brilla (hora de firmar).

---

### Los rituales — Fogata

Cada ritual tiene su hora y su notificación contextualizada en tono Frieren. Registrar rituales se hace en la **Fogata** del campamento.

```
Notificación llega a la hora exacta →
Abrís la app → tap Fogata → tap ✓ en el ritual → cerrás (2 segundos)
```

Cada tap alimenta los stats directamente. El nivel del día se calcula internamente (todas los rituales ✓ = Bien, algunas = Regular, ninguna = Difícil) pero **no se muestra al usuario**. Es solo un input para la IA al calibrar la consecuencia narrativa.

---

### La decisión narrativa — Crónicas + Frieren

La escritura no tiene horario fijo. Podés escribir a la mañana con solo 1 ritual hecho, o a la noche con todas completas. La IA usa los stats al momento de generar la consecuencia.

```
Es tu turno:
Abrís la app → Campamento →
Frieren visible (notificación pulsante) →
Tap Frieren O abrir Crónicas →
Leés la situación (AI, desde donde lo dejó el otro ayer) →
Escribís tu decisión (1-2 oraciones) →
La IA genera la consecuencia cruzando tu decisión con tus stats →
La consecuencia aparece en Crónicas como nueva escena →
Volvés al campamento

No es tu turno:
Abrís la app → Campamento →
Frieren NO visible (ghost) →
Abrís Crónicas → Leés la escena de ayer (la decisión del otro + consecuencia) →
Registrás rituales en Fogata si no lo hiciste →
Listo — el mundo avanza mañana con tu turno
```

**Crónicas** funciona como diario/periódico scrolleable ("Crónicas de Valdris") con todas las escenas pasadas ordenadas cronológicamente, cada una con día, turno, título y texto narrativo. La situación actual del día (si es tu turno) aparece destacada arriba con botón para escribir.

---

### El ritual del domingo — Weekly Close + Boss + Pacto

Siempre 4 pasos, secuenciales. Cada paso vive en su objeto del campamento. El usuario controla el ritmo — puede volver al campamento entre pasos.

**Paso 1 — Cierre semanal (Crónicas)**
Crónicas brilla en el campamento. La IA generó un cierre narrativo de la semana. El tono varía según stats: celebratorio (verdes), neutro (regulares), consecuencias visibles (bajos). Si los dos tuvieron buena racha (5+ días), la escena de vínculo está disponible aquí.

**Paso 2 — Boss semanal (Frieren)**
Frieren aparece después del cierre. **El boss siempre está disponible** — todas las semanas. Los dos leen la situación por separado y escriben su decisión **sin ver la del otro**. La IA aplica la lógica de fusión. El **resultado varía según stats combinados de los 7 días**: victoria épica (verdes), victoria con costo (regulares), derrota con consecuencias que se arrastran (bajos). No es binario — es un espectro.

**Paso 3 — El pacto (Pacto)**
Pacto brilla después del boss. Cada uno responde 4 preguntas por separado: obstáculos de la semana, plan para manejarlos, apoyo mutuo, opcional. La IA genera el Pacto narrativo cuando los dos completaron.

**Paso 4 — La firma (Pacto)**
Tap para firmar tu parte. Cuando el otro también firma, el pergamino se sella con lacre. Asincrónico — cada uno hace su domingo en su propio tiempo.

**Estados del pacto entre semana:**
- Sellado: pergamino con 4 respuestas + firmas + lacre + "X días restantes"
- Esperando firma: pergamino escrito, lacre como círculo punteado, "Kael ✓ · Lyra pendiente"

---

### Ficha de personaje

Tap en tu personaje en el campamento. Vista única scrolleable (no tabs):
1. **Identidad** — la declaración del onboarding
2. **Stats** — Poder (derivado, central) + VIT/STR/INT/STA + racha
3. **Tracker de rituales** — cada ritual con nombre, hora/lugar, racha individual, calendario de 7 días (✓/✕/hoy)
4. **Editar/agregar rituales**

### Nosotros

Solo en co-op. Accesible desde menú hamburguesa. Los dos personajes, el pacto activo, la racha combinada, una línea de la IA que describe quiénes son los dos en este momento de la historia.

---

### Cierre de arco mensual — último domingo del mes

En vez del ritual del pacto normal: la resolución del arco generada por IA según cómo les fue en los 28-30 días. Texto más largo, imagen elaborada (póster del arco), y si fue un mes bueno, video de 15-20 segundos con la cinemática del arco completo vía Veo 3.1.

Una pregunta antes del arco siguiente: *"El reino cambió este mes. ¿Qué querés que el próximo capítulo revele?"* Campo libre. La historia los escucha.

---

## 13. Stack Técnico y Arquitectura

### El stack completo

| Capa | Tecnología |
|---|---|
| **Frontend** | Next.js 15 — App Router, React Server Components, Tailwind CSS. Para uso personal. |
| **Narrativa IA** | Claude API (claude-sonnet-4-20250514) — situaciones, consecuencias, pactos, resoluciones. |
| **Imágenes** | Nano Banana / Gemini Image API — ilustraciones diarias, fondo dinámico reactivo, pósters de arco mensual. |
| **Video** | Veo 3.1 vía Gemini API — clips 6-8 segundos para escenas de vínculo. $0.75/seg. Asincrónico. |
| **Base de datos** | PostgreSQL + Prisma — modelo relacional completo. |
| **Auth + Storage** | Supabase — auth de los dos usuarios + storage de imágenes y videos generados. |
| **Deploy** | Railway o Render — simple, barato, perfecto para uso personal de dos usuarios. |

---

### El contexto que se le pasa a Claude en cada llamada

Claude no tiene memoria entre conversaciones. Cada llamada incluye el estado completo del mundo:

```json
{
  "system_prompt": "estilo_frieren + reglas_mundo + instrucciones_narrativa + reglas_escritura",
  "identidad_p1": "texto libre del onboarding",
  "identidad_p2": "texto libre del onboarding",
  "personaje_1": {
    "nombre": "Kael",
    "arquetipo": "Guerrero",
    "stats": { "vit": 85, "sta": 70, "int": 60, "str": 40 },
    "streak": 6,
    "habito_hoy": "bien",
    "decision_escrita": "Kael toma el camino de la izquierda. Confía en que está listo."
  },
  "personaje_2": {
    "nombre": "Lyra",
    "arquetipo": "Maga",
    "stats": { "vit": 60, "sta": 90, "int": 75, "str": 50 },
    "streak": 3,
    "habito_hoy": "regular",
    "decision_escrita": "Lyra rodea la montaña. No quiere arriesgarse todavía."
  },
  "objetivo_arco": {
    "area": "alimentación",
    "semana_actual": 2,
    "semana_total": 4,
    "tipo_dia": "normal | decision | boss_semanal | arc_close"
  },
  "pacto_semana": {
    "texto_p1_raw": "texto que escribió el usuario",
    "texto_p2_raw": "texto que escribió ella",
    "texto_narrativo": "texto generado por IA el domingo"
  },
  "weekly_boss": {
    "desbloqueado": true,
    "completado": false,
    "descripcion": "La criatura del paso norte"
  },
  "historial": ["últimas 7 escenas + decisiones resumidas"],
  "world_state": {
    "reino": "Valdris",
    "npcs_conocidos": ["..."],
    "zonas": ["..."],
    "decisiones_pasadas_relevantes": ["..."],
    "estado_actual": "..."
  },
  "trigger": "daily | boss_semanal | vinculo | arc_close | arc_open | recovery"
}
```

---

### El modelo de datos — tablas principales

| Tabla | Campos principales |
|---|---|
| `users` | id, nombre_personaje, arquetipo, identidad_texto, created_at |
| `habits` | id, user_id, objetivo_area, descripcion_identidad, created_at |
| `conducts` | id, habit_id, que, cuando_hora, donde, contingency |
| `weekly_pacts` | id, semana, texto_p1, texto_p2, texto_narrativo, firmado_p1, firmado_p2 |
| `daily_checkins` | id, user_id, fecha, nivel (1-3), es_turno_escritura (bool), decision_escrita, nota_libre |
| `stats_history` | id, user_id, fecha, vit, sta, int_stat, str_stat, streak |
| `scenes` | id, tipo, situacion_planteada, decision_p1, decision_p2, texto_consecuencia, imagen_url, video_url, fecha, es_vinculo, arco_id |
| `arcs` | id, mes, nombre, descripcion_inicial, resolucion, semana_actual, cerrado |
| `weekly_bosses` | id, arco_id, semana, desbloqueado, completado, descripcion, escena_id |
| `world_state` | id, reino_nombre, npcs_json, zonas_json, decisiones_relevantes_json, estado_actual, updated_at |

---

### Generación de imágenes y video — flujo asincrónico

**Imagen diaria**
Generada en paralelo con el texto narrativo. El texto llega primero, la imagen en 10-15 segundos. No bloquea la UX.

**Imagen de arco**
Generada el domingo de cierre. Estilo póster de capítulo. Puede tardar — llega como notificación cuando está lista.

**Video de vínculo**
Generado cuando se detecta la racha de 5 días. Proceso asincrónico. Notificación cuando está listo: *"Tu escena de esta semana está lista."* 6-8 segundos, 720p. ~$4.50-$6 por escena.

**Video mensual**
Generado en el cierre de arco. 15-20 segundos. Cinemática del mes completo. Proceso puede tomar minutos. Llega como notificación especial. ~$11-$15 por mes.

---

## 14. Roadmap de Desarrollo

MVP primero. Cada semana agrega una capa nueva solo cuando la anterior funciona y se siente bien. No sobre-diseñar antes de usar. El sistema se expande cuando el personaje sube de nivel.

| Semana | Foco | Qué se buildea |
|---|---|---|
| **Semana 1 — MVP core** | Fundación | Auth de dos usuarios. Onboarding completo (7 pantallas) con identidad primero, arquetipos con rituales sugeridos. Un objetivo + hasta 3 rituales con hora. Check-in básico. Narrativa de texto con Claude. HP decay básico. Sin escritura todavía. Sin imágenes todavía. |
| **Semana 2 — Escritura** | La mecánica central | La IA genera situaciones diarias. El usuario escribe su decisión. La IA cruza decisión + stats y genera consecuencia. El registro y la escritura se fusionan. |
| **Semana 3 — Consecuencias** | El sistema tiene dientes | Escala de consecuencias según días sin registro (1/2/3+). Las consecuencias afectan las situaciones futuras. Streak tracking real. |
| **Semana 4 — Co-op y pacto** | La historia se comparte | Ritual del pacto semanal con firma. Turnos alternados de escritura. Boss semanal compartido con decisiones fusionadas. Pantalla Nosotros. |
| **Semana 5 — Visual** | El mundo cobra vida | Integración Nano Banana. Imagen diaria generada. Fondo dinámico reactivo al estado del mundo. UI atmosférica. |
| **Semana 6 — Vínculo** | El premio que no se pide | Detector de racha de 5 días combinada. Escena de vínculo especial. Integración Veo 3.1 asincrónico. Notificación de cinemática lista. |
| **Semana 7 — Arcos** | La historia tiene memoria | Sistema de arcos mensuales completo. Resolución generativa según stats + decisiones del mes. Póster del arco. Video mensual de 15-20 segundos. |
| **Semana 8+ — Pulido** | Se vuelve vivo | NPCs con memoria persistente. Mapa del mundo que se revela. Tipos de día especiales (decisión/boss). Refinamiento del prompt para fidelidad a Frieren. |

---

### El loop virtuoso completo

```
Hábito real  →  Stats suben  →  Escribís decisión épica
     ↑                                      ↓
Hábito más fácil                La épica sale como la escribiste
     ↑                                      ↓
Identidad más sólida  ←  Satisfacción narrativa  ←  Narrativa Frieren
```

Y el inverso cuando fallás:

```
No cumplís el hábito  →  Stats bajan  →  Escribís decisión épica
                                                    ↓
                              La épica sale con costo real
                                                    ↓
                              El mundo refleja quién estás siendo
                                                    ↓
                              Querés subir los stats para que salga bien
```

---

> *"Un RPG donde la única forma de ser poderoso es crecer de verdad. Donde cada día escribís una decisión y el universo responde según quién estás siendo realmente. Donde si llevás tres días sin cocinar y decidís enfrentarte al boss más difícil del arco, la historia no te deja ganar limpiamente. No porque la IA te castigue — porque Kael genuinamente no tiene las fuerzas para eso todavía."*

---

## 15. Ideas Futuras

Funcionalidades que no entran en el MVP ni en el roadmap inicial, pero que pueden sumarse cuando el sistema core esté sólido y en uso.

### Sistema de recompensas en la vida real

Basado en dos principios de Atomic Habits: **Immediate Reward** (la recompensa tiene que ocurrir hoy, no en seis meses) y **Temptation Bundling** (atás algo que querés a algo que necesitás hacer).

La idea: la recompensa no es por completar una tarea sino por **sostener una identidad** durante un período. No es *"completé 7 días, me gano un café"*. Es *"mi personaje subió de nivel esta semana — yo, que construí ese personaje siendo disciplinado, me permito algo que ese personaje merecería"*.

**Tres niveles posibles:**

- **Level up semanal** — Pequeña, sensorial, inmediata. Café de especialidad, episodio extra de anime, tiempo para cocinar algo elaborado.
- **Arco mensual completo** — Mediana, memorable. Un libro, un ingrediente de cocina, una experiencia.
- **Arco mayor (3 meses)** — Grande, significativa. Un viaje corto, algo que venías postergando.

Las mejores recompensas no son neutrales al hábito — lo **profundizan**. Si tu hábito es alimentación, la recompensa ideal es el libro de cocina, no el cheat meal.

La IA las integraría como ritual narrativo, no como pop-up de gamificación. El usuario las configura en el setup y las marca como reclamadas. Requiere pantalla adicional en el onboarding y tabla `rewards` en la DB.

---

Habit Quest · Game Design Document v4.2 · 2026
