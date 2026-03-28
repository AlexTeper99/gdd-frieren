# Storybook / Narrative Book UI Research

**Date:** 2026-03-24
**Purpose:** Actionable research for designing a "storybook" mobile UI for a Frieren-inspired habit RPG
**Core concept:** "Writing the next paragraph of a shared storybook"
**Palette context:** Sage green + warm gold on dark backgrounds (see design system spec for OKLCH tokens)

---

## 1. Mobile Apps That Look Like Storybooks

### Inkle Studios (80 Days, Sorcery!)

The gold standard for text-as-visual-medium on mobile.

**Key design principles from Inkle:**
- "Text is a visual medium" -- they took full control of typesetting rather than delegating to the OS. Every line break, fade-in, and paragraph reveal is intentional.
- Short, snappy sentences with frequent choices, even cosmetic ones. Faster interaction cycles keep players engaged. Choice is used for **pacing**, not just branching.
- Visible stats that change in response to events reassure readers that "what they're choosing is definitely being noticed."
- 80 Days uses Art Deco-inspired clean, bold colors with smooth gradients and stark silhouettes. Not medieval -- proves storybook feel comes from typography and pacing, not just ornamentation.
- Sorcery! layers a hand-drawn map as the navigation surface, making spatial movement feel like tracing a finger across a book's endpaper map.

**Actionable takeaway for Habit Quest:**
- Animate text appearance per-sentence or per-paragraph (not per-character -- that's visual novel, not storybook).
- Use paragraph reveals tied to scroll position or tap.
- Stats should visibly respond to narrative choices to close the feedback loop.

### Storiaverse (Outcrowd case study)

- Story structures combine plot-advancing animations, dialog, text paragraphs, and sound effects.
- Creates a "cozy, intimate participation effect."
- User controls: font size, favorites, sharing -- readers expect typographic control.

### Visual Novel UI Anatomy

- Character name sits above the main text body, leaving ~1/3 of the text box as whitespace.
- This whitespace is intentional: it keeps the text feeling like a consistent flow, not a wall.
- Text box is typically semi-transparent over the scene, positioned at the bottom 25-30% of the screen.

**Actionable takeaway:** For narrative moments in Habit Quest, consider a bottom-anchored text panel with generous top padding (not a full-screen takeover).

---

## 2. Book Typography for Digital Screens

### Font Selection for Dark Backgrounds

**The problem:** Thin strokes and delicate serif details blur on dark backgrounds, especially on mobile. Pure white (#FFFFFF) on pure black (#000000) causes halation (perceived glow around letters).

**Specific recommendations:**

| Context | Font | Weight | Size | Line-height | Notes |
|---------|------|--------|------|-------------|-------|
| Narrative body text | EB Garamond | 400-500 | 17-19px | 1.6-1.7x | Organic warmth, slightly cupped serifs, angled stress. Calligraphic origins. Bump to 500 weight in dark mode. |
| Narrative body (alt) | Cormorant Garamond | 400-500 | 18-20px | 1.6x | Higher x-height than EB Garamond, sharper serifs. More modern while still literary. |
| Chapter titles | Cinzel | 400 | 24-32px | 1.2x | Small caps feel. Evokes Roman inscriptions. Works for "spell names" and chapter headers. |
| Chapter titles (alt) | Almendra | 400 | 24-32px | 1.3x | Calligraphic with gothic influence. More overtly fantasy. |
| Data/stats | DM Mono (existing) | 400 | 14px | 1.5x | Already in the design system. Keep for mechanical/game data. |
| UI labels | Inter / system sans | 500 | 14-16px | 1.4x | Clean contrast against serif narrative text. |

**Dark mode font weight adjustment:**
- Increase weight by one step (400 -> 500, or use `font-synthesis: weight`)
- CSS variable fonts make this automatic: `font-variation-settings: 'wght' calc(400 + (var(--is-dark) * 100))`
- Mark Boulton's research: use `font-optical-sizing: auto` so the font adjusts stroke contrast for the rendered size

**Critical spacing values:**

```
/* Narrative text block */
font-size: 18px;
line-height: 1.65;
letter-spacing: 0.01em;     /* Slight opening for dark mode */
word-spacing: 0.05em;        /* Subtle breathing room */
max-width: 65ch;             /* Optimal measure for mobile reading */
padding-inline: 24px;        /* Generous margins -- book pages have margins */
```

### Justified vs Left-Aligned

- **Left-aligned wins on mobile.** Justified text creates uneven word spacing ("rivers") on narrow screens.
- Exception: justified works if you have hyphenation enabled (`hyphens: auto`) AND the column is wide enough (>45ch). Mobile rarely hits this.
- For a book feel without justification, use generous margins and centered text blocks -- the margins themselves evoke a book page.

### Drop Caps

**CSS implementation (progressive enhancement):**

```css
.chapter-start::first-letter {
  /* Modern browsers (Chrome 110+, Safari) */
  initial-letter: 3;

  /* Fallback for broader support */
  float: left;
  font-size: 3.5em;
  line-height: 0.8;

  /* Styling */
  font-family: 'Cinzel', serif;
  color: oklch(0.80 0.13 85);  /* gold-400 */
  margin-right: 0.08em;
  padding-top: 0.05em;
}

/* Feature detection */
@supports (initial-letter: 3) {
  .chapter-start::first-letter {
    float: none;
    font-size: unset;
    line-height: unset;
  }
}
```

**Design note:** Use drop caps ONLY at chapter/section starts. Overuse destroys the special feeling. The drop cap letter should use the decorative serif (Cinzel) while body text uses the reading serif (EB Garamond). This contrast is what makes it feel like a real book.

---

## 3. RPG Games with Storybook Aesthetics

### Child of Light (Ubisoft Montreal)

**The most relevant reference for Habit Quest's visual direction.**

- Inspired by 19th-century fairy tale illustrators: John Bauer, Arthur Rackham, Edmund Dulac.
- Watercolor art style applied as a "visual metaphor to bring the player into a dreamscape."
- Saturation averages 30-35% across the entire game -- muted, painterly, never garish.
- Foreground objects create parallax layers "like a theatre set" -- backgrounds layer behind the action.
- Color palette shifts brightness and hue regularly, but saturation stays consistent.

**Actionable takeaway:** The 30-35% saturation rule is directly applicable. The existing OKLCH palette already trends this way (chroma 0.08-0.14 range). Maintain this discipline.

### Octopath Traveler (Square Enix)

- "HD-2D" combines retro sprites with polygonal environments and HD effects.
- UI keeps a "traditional feel while mixing in more modern UI/UX concepts."
- **Lesson learned:** Early versions prioritized aesthetics over UX. Later revisions added UX improvements. Never sacrifice usability for the book metaphor.
- Journal/diary screens use parchment-textured backgrounds with handwritten-style headers.

**Actionable takeaway:** Aesthetics must serve function. If a decorative element slows comprehension, remove it. The storybook should feel effortless to read.

### Ori and the Blind Forest (Moon Studios)

- UI designed by Anna Jasinski. Ability Tree, Inventory, Skill Icons, Map Icons, HUD.
- The UI is minimal and translucent -- it never competes with the environment.
- Organic shapes (no hard rectangles) for menu panels. Edges fade rather than clip.
- Glow effects are reserved for interactive/selected elements.

**Actionable takeaway:** Organic panel edges (soft gradient masks rather than hard borders) can make card-based layouts feel more like illustrated book pages. But use sparingly -- the existing design system rightly limits glow to interactive states only.

### Bravely Default (Square Enix / Silicon Studio)

- Journal/diary UI literally looks like a physical book with page turns.
- Character entries appear as hand-drawn portraits in a traveler's notebook.
- The "D's Journal" is a world-building encyclopedia presented as an in-game artifact.

**Actionable takeaway:** The "party journal" concept in Habit Quest could literally be styled as a shared diary -- handwritten-style headers (Almendra or Caveat font), slightly off-grid alignment, paper-textured backgrounds for that specific view.

---

## 4. Ornamental Design for UI

### What Works in 2026 (Not Tacky)

**The rule:** Ornaments should be **structural**, not decorative. They should delineate sections, mark hierarchy, or signal state changes -- never just "fill space."

**Approaches ranked by modern effectiveness:**

1. **Thin-line geometric dividers** (BEST for Habit Quest)
   - Single horizontal rule with a small centered diamond, circle, or leaf motif
   - 1px stroke, color: gold-600 (muted gold) at 40-60% opacity
   - SVG, not images. Scales perfectly, can animate.
   - Reference: editorial design, not medieval manuscripts

2. **Minimal botanical ornaments** (GOOD for chapter markers)
   - Single leaf, vine curl, or flower. Not a full border.
   - Monochrome or duotone (gold on dark). Never multicolor.
   - Japanese-influenced: asymmetric placement, lots of breathing room
   - Think: a single sage-green leaf glyph between sections

3. **Typographic ornaments** (GOOD for inline separators)
   - Fleurons (❧), asterisms (⁂), or custom small glyphs
   - These are actual Unicode characters -- zero image overhead
   - Use at ~60% opacity of body text color
   - Example: `⟡` or `✦` as section breaks between narrative paragraphs

4. **Art Nouveau-style flowing lines** (USE SPARINGLY)
   - Works for a single "hero" element: the journal header, the party banner
   - Fails when repeated -- becomes wallpaper, loses impact
   - If used: thin stroke (1-2px), gold-400, animated draw-on effect

5. **Medieval manuscript illumination** (AVOID for general UI)
   - Reads as "fantasy cliche" in 2026
   - Exception: could work for a single "achievement unlocked" flourish as a deliberate contrast to the minimalist base

### Japanese Design Principles (Wabi-Sabi)

Directly relevant to the Frieren aesthetic:

- **Ma (negative space):** The empty space IS the design. Do not fill every corner.
- **Fukinsei (asymmetry):** Ornaments placed off-center feel more organic than centered.
- **Shibui (subtle beauty):** Complexity that reveals itself slowly. First glance = simple. Second glance = "oh, that's beautiful."
- **Wabi (rustic simplicity):** Imperfection is valued. A hand-drawn line that's slightly uneven > a mathematically perfect curve.

**Actionable takeaway:** The grain/noise texture overlay already in the design system (2026 anti-perfection trend) aligns with wabi-sabi. Extend this to ornaments: SVG dividers could have subtle irregularity baked into their paths, not pixel-perfect symmetry.

---

## 5. Dark Mode Reading Experiences

### Warm Dark Mode (Sepia/Parchment-Inspired)

**Research finding:** Sepia backgrounds reduce effective radiance by ~25% compared to white, resulting in measurably lower visual fatigue. This matters for an app where users read narrative text.

**Color temperature recommendations:**

| Mode | Background | Text | Accent | Feel |
|------|-----------|------|--------|------|
| Cool dark (current) | oklch(0.11 0.015 260) | oklch(0.87 0.01 260) | gold-400 | Default. Crisp, modern. |
| Warm dark (reading) | oklch(0.13 0.02 60) | oklch(0.85 0.03 70) | gold-400 | Paper-like. For long narrative. |
| Sepia dark | oklch(0.15 0.03 55) | oklch(0.82 0.04 65) | gold-500 | Parchment-in-firelight feel. |

**The warm shift:** Moving the background hue from 260 (cool blue) to 55-70 (warm amber) and adding chroma 0.02-0.03 creates the sensation of aged paper without leaving dark mode. Text should warm to match (hue 65-70 instead of neutral).

**Key finding from e-reader research:** Kindle's warm mode creates "a lighter brown text on brown background, similar to old parchment." This is exactly the Frieren aesthetic -- a journal read by firelight.

### Background Textures

**CSS noise/grain technique (no images needed):**

```css
.narrative-surface {
  background-color: oklch(0.13 0.02 60);
  position: relative;
}

.narrative-surface::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.06;  /* Very subtle -- 6% */
  filter: url("data:image/svg+xml,...#noise");
  /* Use feTurbulence SVG filter */
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

**Opacity guidelines:**
- 4-8%: barely perceptible, adds organic depth. Best for reading surfaces.
- 10-15%: clearly visible texture. Good for decorative panels, not for reading.
- 15%+: starts to interfere with text legibility. Avoid for narrative content.

**Paper grain effect:** Use `feTurbulence` with `type="fractal"`, `baseFrequency="0.65"`, `numOctaves="3"`. This produces a grain that reads as paper fiber rather than digital noise.

---

## 6. Scroll-Based Narrative UIs

### Scrollytelling Techniques

**Key stats:** Sites using well-designed scrollytelling report 200-300% higher engagement time and 70% increased content comprehension vs. traditional layouts.

**Applicable patterns for Habit Quest:**

1. **Progressive text reveal on scroll**
   - As the user scrolls, new narrative paragraphs fade in from below
   - Previous paragraphs remain but dim slightly (opacity 0.7 -> 1.0 for current paragraph)
   - Creates the feeling of "the story writing itself"
   - Implementation: Intersection Observer API with CSS transitions

2. **Pinned narrative sections**
   - A narrative moment stays pinned while background elements (stats, illustrations) animate
   - The text is the anchor; the world changes around it
   - Implementation: `position: sticky` with scroll-linked animations

3. **Parallax depth layers**
   - Background illustration moves at 0.3x scroll speed
   - Midground ornaments at 0.6x
   - Text at 1.0x (normal)
   - Creates depth without being disorienting
   - Implementation: CSS `scroll-timeline` or GSAP ScrollTrigger

4. **Typewriter/inscription reveal**
   - For special moments (quest completion, narrative milestone), text appears letter-by-letter
   - Use sparingly -- only for "epic" moments. Daily narrative should be paragraph-level reveals.
   - Speed: 30-50ms per character for readable typewriter effect

**Libraries to consider:**
- GSAP ScrollTrigger (most mature, best mobile performance)
- Framer Motion (React-native, good for Next.js integration)
- CSS `scroll-timeline` (native, but still limited browser support in 2026)

### Mobile-Specific Considerations

- Parallax effects should be subtle on mobile (0.1-0.3x differential, not 0.5x+)
- Always provide a "skip" for animated text reveals -- accessibility requirement
- Touch scrolling has momentum; scroll-linked animations must account for overscroll
- Reduce motion for `prefers-reduced-motion: reduce`

---

## 7. Typography Pairings for Fantasy/Storybook

### Recommended Pairings (All Google Fonts, Free)

**Primary recommendation for Habit Quest:**

```
Headings:   Cinzel          (400, 600)     -- Roman inscription feel, small-cap aesthetic
Narrative:  EB Garamond      (400, 500, 600i) -- Humanist serif, calligraphic warmth
Data/Stats: DM Mono          (400)          -- Already in design system
UI Labels:  Inter            (400, 500)     -- Clean sans, high x-height
```

**Why this works:**
- Cinzel (display) + EB Garamond (text) creates a hierarchy: carved stone titles above flowing handwritten prose.
- Both are serif, but Cinzel's all-caps geometry contrasts sharply with EB Garamond's organic lowercase.
- The contrast between serif narrative and monospace data creates a "two worlds" feeling: the story vs. the game mechanics.

**Alternative pairings:**

| Heading | Body | Vibe |
|---------|------|------|
| Cinzel Decorative | Cormorant Garamond | High fantasy, illuminated manuscript. Cinzel Decorative has built-in ornamental serifs. |
| Playfair Display | Lora | Elegant editorial. Less overtly fantasy, more "literary magazine." |
| Almendra | Cardo | Medieval calligraphy. Almendra has gothic influence; Cardo is a scholarly serif. |
| Cormorant SC | EB Garamond | Refined. Cormorant SC (small caps) as headings with EB Garamond body is subtle and sophisticated. |

### Specific CSS Implementation

```css
/* next/font loading in Next.js */
/* In layout.tsx or fonts.ts: */

/* Headings */
--font-heading: 'Cinzel', serif;
--heading-weight: 400;
--heading-letter-spacing: 0.08em;  /* Cinzel needs tracking opened up */
--heading-line-height: 1.2;

/* Narrative body */
--font-narrative: 'EB Garamond', serif;
--narrative-weight-light: 400;      /* Light mode */
--narrative-weight-dark: 500;       /* Dark mode -- bump one step */
--narrative-size: clamp(1.0625rem, 0.95rem + 0.5vw, 1.1875rem);  /* 17-19px fluid */
--narrative-line-height: 1.65;
--narrative-letter-spacing: 0.012em;

/* Drop cap letter */
--font-drop-cap: 'Cinzel Decorative', serif;  /* Or Cinzel */
--drop-cap-color: oklch(0.80 0.13 85);        /* gold-400 */
--drop-cap-lines: 3;
```

### Fonts with Calligraphic Qualities Still Readable at Body Size

| Font | x-height | Best at | Notes |
|------|----------|---------|-------|
| EB Garamond | Medium | 17-20px | The best all-rounder. Calligraphic italics are gorgeous. |
| Cormorant Garamond | High | 18-22px | Sharper than EB Garamond. Bolder visual presence. |
| Lora | High | 16-18px | Calligraphic curves but contemporary proportions. Very readable. |
| Cardo | Medium | 17-20px | Scholarly, based on Aldus Manutius typefaces. Quiet elegance. |
| Spectral | High | 16-18px | Designed specifically for screen reading. Calligraphic details. |
| Alegreya | High | 16-20px | Dynamic, calligraphic. Has a Sans companion for UI pairing. |

---

## 8. Frieren-Specific Visual Translation

### Frieren's Anime Color Language

Research confirms Frieren's palette is distinctly Ghibli-esque:
- Muted, unsaturated -- high-intensity anime colors are deliberately absent
- Soft greens (#90C6A7), cream beige (#DFE1BC), muted teals (#3D646A), soft purples (#A49FB8)
- Nature and scenic backgrounds are "a marvel in their own right" -- environment as character
- During nostalgia/reflection: softer tones, gentle animation, sense of longing

**Translation to UI:**
The Frieren aesthetic is about **restraint**. The app should feel like a quiet forest clearing, not a busy marketplace. Every ornament earned its place.

### Mapping Frieren Themes to UI Patterns

| Frieren Theme | UI Expression |
|---------------|---------------|
| Passage of time | Slow fade-ins, unhurried transitions (300-500ms easing) |
| Found in small things | Micro-interactions on mundane elements (a stat number settling into place) |
| Memories surfacing | Previous journal entries appear with a slight sepia shift |
| Magic as everyday craft | Stat changes animate with subtle particle/glow, not fireworks |
| Shared journey | Party member avatars subtly present in margins/headers |
| Melancholic beauty | Muted palette, generous whitespace, serif typography |

---

## 9. Consolidated Implementation Checklist

### Typography Stack
- [ ] Load Cinzel (400, 600) via `next/font/google`
- [ ] Load EB Garamond (400, 500, 600, 400i, 500i) via `next/font/google`
- [ ] DM Mono already loaded
- [ ] Set CSS custom properties for all font tokens
- [ ] Implement dark mode weight bump (400 -> 500 for narrative text)
- [ ] Set `font-optical-sizing: auto` on all text

### Narrative Text Rendering
- [ ] Left-aligned, not justified
- [ ] `max-width: 65ch` for optimal measure
- [ ] `line-height: 1.65` for body, `1.2` for headings
- [ ] `letter-spacing: 0.012em` for body in dark mode
- [ ] Drop caps on chapter/section starts using `initial-letter: 3` with float fallback
- [ ] Off-white text color: `oklch(0.87 0.01 260)` -- never pure white

### Ornamental System
- [ ] SVG divider component: thin line + centered motif (leaf, diamond, or fleuron)
- [ ] Divider color: gold-600 at 50% opacity
- [ ] Section break glyph: typographic ornament (e.g., `✦` or `⟡`) in gold-400
- [ ] Drop cap font: Cinzel in gold-400
- [ ] All ornaments: SVG with subtle path irregularity (wabi-sabi)

### Background & Surface
- [ ] Grain texture overlay via SVG `feTurbulence` filter at 4-8% opacity
- [ ] Narrative reading surface: consider warm shift (hue 55-70) for extended reading
- [ ] No pure black (#000000) backgrounds -- use oklch(0.11 0.015 260) minimum

### Scroll & Animation
- [ ] Narrative paragraphs: fade-in on scroll via Intersection Observer
- [ ] Current paragraph highlight (opacity 1.0 vs 0.7 for past paragraphs)
- [ ] Transition duration: 300-500ms with ease-out
- [ ] Respect `prefers-reduced-motion`
- [ ] Skip button for any animated text reveals

---

## Sources

- [Storiaverse UX/UI Case Study (Outcrowd)](https://www.outcrowd.io/blog/case-study-ux-ui-design-development-for-storiaverse)
- [80 Days: Next Generation Interactive Fiction (Medium)](https://medium.com/ios-os-x-development/next-generation-interactive-fiction-80-days-379b9a2ad1c5)
- [80 Days: 50 Years of Text Games (Substack)](https://if50.substack.com/p/2014-80-days)
- [Typography in Dark Mode (Design Shack)](https://designshack.net/articles/typography/dark-mode-typography/)
- [Optimizing Typography for Dark Mode (Design Work Life)](https://designworklife.com/optimizing-typography-for-dark-mode-interfaces/)
- [Dark Mode Font Readability (RAIS Project)](https://raisproject.com/dark-mode-font-readability/)
- [Best Fonts for Reading (Fontfabric)](https://www.fontfabric.com/blog/best-fonts-for-reading/)
- [Best E-Book Fonts (PDF.net)](https://pdf.net/blog/best-e-book-fonts)
- [Game UI Database -- Octopath Traveler](https://www.gameuidatabase.com/gameData.php?id=741)
- [Octopath Traveler UI/UX Review (Rambling About Games)](https://www.ramblingaboutgames.com/blog/octopath-uiux)
- [Game UI Database -- Child of Light](https://www.gameuidatabase.com/gameData.php?id=137)
- [Child of Light Design Analysis (Nabauer)](https://nabauer.com/child-of-light-design-analysis/)
- [The Art of Child of Light (GDC Vault)](https://gdcvault.com/play/1020561/The-Art-of-Child-of)
- [Game UI Database -- Ori and the Blind Forest](https://www.gameuidatabase.com/gameData.php?id=92)
- [Ori and the Blind Forest UI (Anna Jasinski, ArtStation)](https://www.artstation.com/artwork/zxJZ6)
- [Dark Mode UI Best Practices (LogRocket)](https://blog.logrocket.com/ux-design/dark-mode-ui-design-best-practices-and-examples/)
- [Dark Mode Design Guide (UI Deploy)](https://ui-deploy.com/blog/complete-dark-mode-design-guide-ui-patterns-and-implementation-best-practices-2025)
- [Sepia Reading Mode (Libby)](https://help.libbyapp.com/en-us/6046.htm)
- [Sepia Color Palettes (media.io)](https://www.media.io/color-palette/sepia-color-palette.html)
- [Complete Scrollytelling Guide (UI Deploy)](https://ui-deploy.com/blog/complete-scrollytelling-guide-how-to-create-interactive-web-narratives-2025)
- [Scrollytelling: Immersive Narrative Experiences (UI Deploy)](https://ui-deploy.com/blog/scrollytelling-creating-immersive-narrative-experiences)
- [Scrollytelling (PandaSuite)](https://pandasuite.com/blog/scrollytelling/)
- [Parallax Scrolling for Storytelling (Fluer)](https://fluer.com/blog/design/how-to-use-parallax-scrolling-to-enhance-your-website-s-storytelling)
- [Drop Caps: Historical Use and CSS (Smashing Magazine)](https://www.smashingmagazine.com/2012/04/drop-caps-historical-use-and-current-best-practices/)
- [CSS initial-letter (Chrome Developers)](https://developer.chrome.com/blog/control-your-drop-caps-with-css-initial-letter)
- [Drop Caps (CSS-Tricks)](https://css-tricks.com/snippets/css/drop-caps/)
- [EB Garamond (Google Fonts)](https://fonts.google.com/specimen/EB+Garamond)
- [Cormorant Garamond (Google Fonts)](https://fonts.google.com/specimen/Cormorant%2BGaramond)
- [Best Google Fonts 2026 (Typewolf)](https://www.typewolf.com/google-fonts)
- [Google Fonts Fantasy/Medieval Picks (Technical Wall)](https://technicalwall.com/google/best-medieval-fonts-on-google-docs/)
- [Fontpair: Cormorant Garamond Pairings](https://fontpair.co/fonts/cormorant-garamond)
- [Wabi-Sabi Design Principles (Refined Japan)](https://refinedjapan.com/what-is-japanese-aesthetics/)
- [Wabi-Sabi in Design (Creative Market)](https://creativemarket.com/blog/trend-report-wabi-sabi-japanese-design)
- [Grainy Gradients CSS (CSS-Tricks)](https://css-tricks.com/grainy-gradients/)
- [CSS Noise Backgrounds (ibelick)](https://ibelick.com/blog/create-grainy-backgrounds-with-css)
- [SVG Noise Generator (fffuel)](https://www.fffuel.co/nnnoise/)
- [CSS Paper Effects (Subframe)](https://www.subframe.com/tips/css-paper-effect-examples)
- [Optical Sizing for Dark Mode (Mark Boulton)](https://markboulton.co.uk/journal/optical-sizing-for-dark-mode/)
- [Dark Mode and Variable Fonts (CSS-Tricks)](https://css-tricks.com/dark-mode-and-variable-fonts/)
- [Sage Green in Design (Figma Colors)](https://www.figma.com/colors/sage/)
- [Gold + Dark Green Pairing (media.io)](https://www.media.io/color-palette/gold-dark-green-color-palette.html)
- [Frieren Color Palette (trycolors)](https://trycolors.com/palette/babxdg)
- [Frieren's Ghibli-esque Aesthetic (FandomWire)](https://fandomwire.com/frieren-beyond-journeys-end-has-the-essence-of-a-studio-ghibli-film/)
- [Visual Novel UI Anatomy (FuwaBoard)](https://forums.fuwanovel.moe/blogs/entry/4226-ui-design-%E2%80%93-an-anatomy-of-visual-novels/)
- [Visual Novel UI Design Guide (NomnomNami)](https://nomnomnami.itch.io/how-can-i-design-a-good-ui-for-my-vn)
- [Kindle Reading Customization (Amazon)](https://www.amazon.com/b/?node=11516960011)
- [KDP Text Guidelines (Amazon)](https://kdp.amazon.com/en_US/help/topic/GH4DRT75GWWAGBTU)
