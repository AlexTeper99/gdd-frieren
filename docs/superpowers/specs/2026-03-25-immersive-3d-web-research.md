# Immersive 3D Web Experiences Research

**Date:** 2026-03-25
**Purpose:** Understand what makes Awwwards-level immersive 3D web experiences feel magical, with specific examples, technical patterns, and implementation details.

---

## 1. Award-Winning 3D Web Experiences (2024-2025)

### Igloo Inc -- Awwwards Site of the Year AND Developer Site of the Year 2024

- **URL:** [igloo.inc](https://igloo.inc)
- **Studio:** [Abeto](https://www.awwwards.com/abeto/) (in collaboration with Bureaux)
- **Stack:** Three.js, Svelte, GSAP, Vite, three-mesh-bvh, vanilla JS
- **Asset tools:** Houdini, Blender
- **Jury quote:** "Pure art, like your favorite video game transformed into a website. Unique, delightful animations and blazing fast performance."

**What makes it exceptional:**

- The entire UI is rendered in WebGL -- no DOM text at all. Text effects (glitches, letter scramble) are handled via shaders: they swap SDF texture offsets instead of forcing browser relayout on every frame.
- Ice blocks encasing portfolio projects use a **custom crystal growth algorithm** that simulates crystal growth inside a container shape. Procedural, so every project gets unique ice formations without manual modeling.
- Camera drifts between scenes with **chromatic aberration** and **frost dissolve** transitions.
- Footer features an interactive particle simulation powered by **custom VDB-to-browser volume data** (compressed smaller than a typical website image). Particles coalesce into different 3D shapes on hover, with color shifting based on particle velocity.
- The team worked on code and 3D art simultaneously in-browser with **custom dev tools** for live-updating shaders, textures, and models in real time.
- Minimized initial load through custom geometry exporters and strategies for lazy-loading textures and deferred shader compilation.

**Key lesson:** The team operates at the intersection of game development and web development. Everything -- including UI text -- lives in WebGL, which eliminates the DOM/canvas synchronization problem entirely.

---

### Sculpting Harmony -- Awwwards Site of the Year nominee / Site of the Month Nov 2023

- **URL:** [gehry.getty.edu](https://gehry.getty.edu/)
- **Studio:** Resn (for the Getty Research Institute)
- **Stack:** Nuxt, Vue.js, Three.js, GSAP (ScrollTrigger), Storyblok CMS, Scrolly Video
- **Subject:** Digital exhibition celebrating 20 years of Frank Gehry's Walt Disney Concert Hall

**Technical details:**

- Three.js renders **photogrammetry models** from Getty's scanned 3D archives -- detailed scaled replicas of Gehry's architectural concepts.
- GSAP timeline animation paired with ScrollTrigger controls animation flow: title animations use SVG components with ScrollTrigger that stretch/contract vertical scale proportional to scroll position.
- Scrolly Video manages scroll-triggered video playback for documentary segments.
- The result of 7+ years of archiving, 3D imaging, and digitization, combined with 2 years of research and 6 months of design/dev.

**Key lesson:** Scroll-driven storytelling through real artifacts (photogrammetry) feels museum-quality. The combination of GSAP ScrollTrigger with Three.js camera movement creates a cinematic guided tour.

---

### Hatom -- Awwwards Site of the Month December 2024

- **URL:** [hatom.com](https://hatom.com)
- **Studio:** Immersive Garden (France)
- **Stack:** Next.js, WebGL, GSAP, CSS, HTML, JavaScript
- **Score:** 7.96/10 on Awwwards

**What makes it exceptional:**

- Symbolic storytelling: narrative begins with an egg hatching into a griffon, symbolizing the company's growth and evolution -- leading to a connected ecosystem of planets representing their expanding crypto protocols.
- WebGL 3D elements with gesture-driven interaction and scrolling.
- Experimental design with only 2 accent colors (#F76CFE, #C1FF12).
- Team of 10+ including dedicated concept artists, 3D artists, and creative developers.

**Key lesson:** Strong narrative metaphor (griffon evolution = company growth) makes abstract business content feel like a story worth experiencing.

---

### David Whyte Experience -- Awwwards Site of the Month January 2025

- **URL:** [david-whyte-experience.com](https://david-whyte-experience.com)
- **Studio:** Immersive Garden (France)
- **Stack:** Three.js, custom GLSL shaders, Blender

**Technical details:**

- 3D environment and camera movement set up in **Blender**, then recreated in WebGL using Three.js with **custom shaders** to make everything dynamic and interactive.
- **Watercolor mouse effect based on fluid simulation:** a separate simulation runs for each visible sheet of paper in the scene. A **simulation atlas** was developed using the **stencil buffer** to activate only the relevant sections of the texture -- a critical performance optimization.
- Long-pressing any painting reveals a video of the actual location that inspired it.
- Immersive journey through watercolor landscapes shaped by the places that inspired poet David Whyte.

**Key lesson:** The stencil buffer atlas technique for running multiple fluid simulations efficiently is clever engineering. The "paint comes alive under your cursor" effect creates an emotional connection to the art.

---

### Lusion Studio Portfolio -- Awwwards Site of the Month / Developer Award

- **URL:** [lusion.co](https://lusion.co)
- **Studio:** Lusion (Bristol, UK)
- **Stack:** Custom WebGL, Three.js, proprietary tooling

**Technical details:**

- Data stored as **16-bit integer data with a divider** to retrieve values in WebGL shaders -- significant file size reductions for complex data.
- For the homepage Beethoven 3D model: **pre-rendered normal, ambient occlusion, thickness, and 2 sets of diffused illuminations** into a single image, combined with 2 matcap images to render a translucent object with 2 different states dynamically.
- "My Little Storybook" project (Webby Award, Best Visual Design): 3D assets crafted from scratch, hand-drawn sketches blended into WebGL environment.

**Key lesson:** Pre-baking complex lighting data into texture atlases enables rich, translucent materials that would be too expensive to compute in real time. The "pre-render everything possible" philosophy runs through the best WebGL work.

---

### Bruno Simon Portfolio -- Awwwards Site of the Month (foundational reference)

- **URL:** [bruno-simon.com](https://bruno-simon.com)
- **Stack:** Three.js, Cannon.js (physics), Blender, GLTF with Draco compression

**Technical details:**

- Users control a toy car through a 3D environment to explore portfolio content.
- **Dual-world architecture:** a visible Three.js world (detailed models) + a parallel Cannon.js physics world (simplified primitive shapes -- cubes, cylinders, spheres). After each physics update, the visible universe syncs coordinates from the primitives universe.
- Models exported as GLTF with **Draco compression** (50-70% lighter depending on geometry).
- Car antenna animated without physics engine: rotated according to the opposite acceleration, with a spring-back force proportional to displacement.
- Low-poly aesthetic keeps the scene lightweight while feeling charming.

**Key lesson:** The dual-world (render world + physics world with simplified geometry) pattern is a proven game dev technique brought to the web. Draco-compressed GLTF is the standard for web 3D asset delivery.

---

## 2. Technical Patterns in Award-Winning Experiences

### Pattern A: Scroll-Driven 3D Cinematics

The dominant pattern in award-winning 3D sites is **scroll-as-timeline**. The architecture:

1. **Fixed WebGL canvas** fills the viewport as background
2. **GSAP ScrollTrigger** with `scrub: true` maps scroll position to a timeline
3. Timeline tweens **camera position**, **look-at target**, **lighting**, and **shader uniforms**
4. Custom easing curves control feel: `"0.45,0.05,0.55,0.95"` for silk-like motion
5. Camera position/target stored in mutable refs, applied in the render loop via `camera.position.set()` + `camera.lookAt()`

**Scroll synchronization stack (2024-2025 standard):**
- **Lenis** for smooth scrolling (originally created specifically for WebGL/DOM sync)
- **GSAP ScrollTrigger** for animation orchestration
- **Three.js useFrame / requestAnimationFrame** for render loop integration
- Integration pattern: GSAP ticker drives everything; Lenis updates scroll; render happens on each tick

**Common scroll-triggered effects:**
- Camera fly-through along a spline path
- Fog density changes to reveal/hide sections
- Shader uniform `uProgress` (0 to 1) controls reveal effects per viewport section
- Text animated with SplitText + staggered character timing (`stagger: 0.02`)
- Particle opacity tied to scroll velocity/momentum

### Pattern B: Explorable 3D Environments

Sites where the user directly controls a character or camera:

- **Bruno Simon:** WASD/arrow keys to drive a car through a 3D world
- **Thibault Introvigne:** (React Three Fiber) Control a spaceman, collect 10 collectibles in a colorful world
- **WoraWork:** Zelda/Animal Crossing-style world with house and garden exploration
- **JReyes MC:** Minecraft-inspired house exploration via scroll circuit (Awwwards Honorable Mention)
- **Jordan Breton:** Floating island in the sky with grass, waterfall, fire, wind, trees, butterflies (FWA Site of the Day)
- **Samsy:** Cyberpunk cityscape with first-person controls, WebGPU, 120+ FPS

**Common architecture:**
- Character model from Blender, animations from **Adobe Mixamo**
- GLTF/GLB format with Draco compression
- OrthographicCamera for isometric views, PerspectiveCamera for first-person
- Physics via Cannon.js or Rapier (WASM)
- Input handling: keyboard listeners mapped to velocity vectors

### Pattern C: Fully WebGL UI (No DOM)

The Igloo Inc approach -- render everything including text in WebGL:
- Text via **SDF (Signed Distance Field)** textures -- resolution-independent, shader-driven
- Letter scramble effects = swapping SDF texture UV offsets
- Eliminates DOM/canvas sync issues entirely
- Requires custom tooling for content editing
- Best for portfolio/showcase sites where content is fixed

### Pattern D: DOM Overlaid on 3D Canvas

The more common approach for content-heavy sites:

**With React Three Fiber (drei):**
- `<Html>` component from drei: renders DOM elements that track 3D positions
- Uses `Vector3.project(camera)` to convert 3D world coords to 2D screen coords
- CSS `position: absolute` with computed `left`/`top` properties
- Limitation: no true occlusion (DOM elements can't hide behind 3D geometry)

**With vanilla Three.js:**
- HTML overlay container positioned over the canvas via CSS
- Points in 3D space projected to screen coordinates each frame
- CSS transitions and `:hover` work normally on overlay elements

**With r3f-scroll-rig (14islands):**
- Tracks "proxy" HTML elements in normal page flow
- Updates WebGL scene positions to match proxy element positions during scroll
- Enables per-section cameras, lights, and environment maps
- Avoids the browser limit on WebGL contexts (a problem with multiple canvases)

---

## 3. Isometric / Diorama-Style 3D Scenes

### Techniques for the "Miniature World" Look

**Camera:**
- `OrthographicCamera` for true isometric (no perspective distortion)
- For "pseudo-isometric" with slight depth feel: `PerspectiveCamera` with very low FOV (10-15 degrees) and far camera distance

**Baked Lighting (the standard for dioramas):**
- Pre-render all lighting, shadows, ambient occlusion in Blender
- Export as a single baked texture atlas applied to all meshes
- Achieves photorealistic lighting with the performance cost of a simple image
- No dynamic lights needed at runtime = huge performance win
- Complemented by cheap lights (Ambient, Directional) for subtle dynamic variation

**Tilt-Shift Effect (makes scenes feel miniature):**
- `HorizontalTiltShiftShader` + `VerticalTiltShiftShader` passes via EffectComposer
- Creates selective blur that mimics macro photography depth of field
- Combined with slightly boosted color saturation for toy-like appearance
- Dynamic parameters updated each frame with auto-focus approximation

**Stylized Materials:**
- `MeshToonMaterial` or custom toon shader for cel-shaded look
- Gradient map (n x 1 texture) controls shading levels
- Outline pass for edge visibility (cell animation style)
- `MeshDistortMaterial` / `MeshWobbleMaterial` from drei for organic, living feel

### Specific Isometric/Diorama Examples

- **Three.js Journey Isometric Room Challenge:** community-built rooms using OrthographicCamera + baked lighting
- **DanieloM83/THREE.js-Interactive-Isometric:** Small website with interactive 3D isometry
- **"Discount Elysium":** Small isometric world with a playable character
- **Eidolon RPG:** Browser-based isometric action RPG built with Three.js, using ECS architecture, instanced rendering, and frustum culling

---

## 4. RPG / Game-Like Web Experiences

### Eidolon -- Browser Isometric Action RPG

**Architecture:**
- Custom **Entity Component System (ECS)**: Entity class with Map-based components (Transform, Velocity), Systems that query for component combinations
- Dynamic Three.js lighting with real-time shadows + ambient occlusion
- GLTF/GLB model loading; assets compressed with `gltf-transform`

**Performance optimizations for game-like experiences:**
- **Frustum culling:** `THREE.Frustum` to render only what the camera sees
- **Instanced rendering:** `InstancedMesh` for repeated geometry (trees, rocks, enemies) -- hundreds of thousands in a single draw call
- **Object pooling:** Pre-allocated pools for projectiles, particles, effects -- no allocation during gameplay
- **Delta-time movement:** `position.x += velocity.x * delta` for frame-rate-independent motion
- Target: 60 FPS on mobile

### Game-Style Portfolio (Saurabh)

- Four distinct rooms (office, studio, hobby room, library)
- First-person roaming with character animations from Adobe Mixamo, refined in Blender
- Interactive clickable objects trigger modal popups
- Mini-game embedded: "Debug Hero" -- squash bugs using code projectiles
- Gesture-controlled easter eggs
- Dockerized, hosted on Google Cloud Run

### Key Patterns for "RPG Feel" on the Web

1. **Character with animated walk cycle** (Mixamo is the standard source)
2. **Explorable space with discoverable content** (click objects to reveal info)
3. **Mini-games or challenges** embedded in the experience
4. **Sound design** (ambient loops, interaction SFX)
5. **HUD-style UI** overlaid on the 3D view
6. **State/progression** -- collectibles, visited areas, unlocked content

---

## 5. Post-Processing Effects Stack

### The "Standard" Awwwards Post-Processing Stack

Based on what ships in award-winning sites, the most common effects layered together:

| Effect | Purpose | Performance Cost |
|--------|---------|-----------------|
| **Bloom** | Glow around bright areas; selective by default via luminanceThreshold | Medium |
| **Depth of Field** | Focus plane with progressive blur; cinematic camera feel | High |
| **Vignette** | Darkened corners; draws attention to center | Very Low |
| **Film Grain / Noise** | Analog texture; prevents banding; adds warmth | Very Low |
| **Chromatic Aberration** | RGB channel offset at edges; lens imperfection feel | Low |
| **Color Grading / Tone Mapping** | LUT-based color correction; sets mood | Low |
| **SSAO (Screen-Space Ambient Occlusion)** | Contact shadows in crevices; adds depth | High |
| **Anti-aliasing (FXAA/SMAA)** | Edge smoothing | Low-Medium |

### Implementation with React Three Fiber

```
@react-three/postprocessing (pmndrs)
```

- Automatically organizes and merges effect combinations for minimum overhead
- Common declarative stack: `<EffectComposer>` wrapping `<DepthOfField>`, `<Bloom>`, `<Noise>`, `<Vignette>`
- Bloom is selective by default: materials must have colors lifted above the 0-1 range to glow (luminanceThreshold of 1 = nothing glows by default)
- ESM-only, React 19+ required (as of 2025)

### Implementation with vanilla Three.js

- `EffectComposer` class manages passes
- Film grain, sepia, and vignette can be merged into a single render pass
- Custom post-processing via `ShaderPass` with custom GLSL

### Specific Effects from Award Winners

- **Igloo Inc:** Chromatic aberration + frost dissolves between scenes; particle color shifts based on velocity
- **David Whyte:** Fluid simulation watercolor effect (stencil buffer atlas)
- **Lusion:** Pre-baked normals + AO + thickness + diffused illuminations into texture; matcap rendering for translucent objects
- **Sculpting Harmony:** Scroll-driven fog density + camera depth changes

---

## 6. 3D Canvas + DOM UI Blending Techniques

### Approach 1: HTML Overlay (Most Common)

An absolutely-positioned HTML container sits on top of the Three.js canvas:

- 3D positions projected to 2D screen coordinates via `Vector3.project(camera)`
- CSS `left` / `top` updated per frame
- Full CSS styling, `:hover`, transitions work normally
- **Limitation:** Can't achieve occlusion behind 3D geometry
- **Performance warning:** Many HTML labels = significant perf hit

### Approach 2: drei `<Html>` Component (R3F)

- Place `<Html>` inside a `<mesh>` -- it automatically follows the 3D object
- Rendered via react-dom reconciler despite being inside Canvas
- Good for annotations, tooltips, labels attached to 3D objects
- Same occlusion limitation as vanilla HTML overlay

### Approach 3: Dual Renderer

- Render 3D scene with PerspectiveCamera
- Render HUD layer on top with OrthographicCamera
- Blend/composite the two renders
- Used for game-style HUDs that need to feel "part of" the 3D world

### Approach 4: r3f-scroll-rig (14islands Pattern)

- Normal HTML page with scroll content
- "Proxy" elements mark where 3D content should appear
- WebGL canvas tracks proxy positions and renders 3D content to match
- Each section can have its own camera, lights, environment
- Solves the "multiple WebGL context" browser limit

### Approach 5: Everything in WebGL (Igloo Inc Pattern)

- No DOM text at all -- SDF font rendering in shaders
- Eliminates sync problems entirely
- Requires custom content tooling
- Best for fixed-content showcase sites

### Approach 6: VFX-JS Overlay

- Large WebGL canvas overlays the page
- 3D elements positioned to match original HTML image/element locations
- Shader effects (distortion, grain, RGB shift) applied to DOM-positioned elements
- Good for adding WebGL effects to otherwise traditional pages

---

## 7. Performance Optimization Patterns (2024-2025 Consensus)

### Asset Pipeline

1. Model in Blender with low-poly awareness
2. Decimate Modifier to reduce polygon count while maintaining shape
3. Bake lighting into textures for static objects
4. Export as `.glb` / `.gltf`
5. Compress with `gltfjsx -S -T -t` (reported 90% size reduction) or `gltf-transform`
6. Draco compression for geometry (50-70% lighter)
7. Textures at power-of-2 resolutions (128, 256, 512, 1024)

### Rendering

- **Draw calls:** Target under 1000, ideally a few hundred
- **InstancedMesh:** Repeated geometry in single draw calls (trees, rocks, particles)
- **Frustum culling:** Only render what the camera sees
- **LOD (Level of Detail):** Separate InstancedMesh objects per detail level; swap based on distance
- **Device Pixel Ratio:** Cap at 1.0 desktop / 1.5 mobile; use `PerformanceMonitor` to dynamically adjust
- **On-demand rendering:** Only re-render when something changes (saves mobile battery)
- **Environment maps over dynamic lights:** Cheaper, often look better

### React Three Fiber Specific

- Mutate in `useFrame`, never in React state -- avoid triggering re-renders
- `instancedArray` creates persistent GPU buffers that survive across frames
- Disable post-processing when framerates drop (adaptive quality)

---

## 8. What Makes These Experiences Feel "Magical"

Synthesizing across all the award winners, the common threads:

### 1. Narrative-Driven Design
Every top site tells a story. It's not "here's a 3D scene" -- it's "travel through this world and discover something." Sculpting Harmony tells Gehry's creative process. David Whyte brings poetry to life through watercolor. Igloo Inc makes a corporate landing page feel like exploring an ice cave.

### 2. Custom Shaders Over Off-the-Shelf Effects
The winners don't just stack bloom + vignette. They invent effects tied to the concept: fluid watercolor simulation, crystal growth algorithms, frost dissolves, SDF text scrambling. The shader IS the concept.

### 3. Impeccable Scroll Feel
Lenis + GSAP ScrollTrigger + custom easing curves = scroll that feels physical. Small variations in easing "dramatically affect visual rhythm." The scroll isn't just triggering animations -- it IS the interaction.

### 4. Sound Design (Often Overlooked)
Ambient audio, subtle interaction sounds, and music tied to scroll/interaction sections create immersion that visuals alone can't achieve.

### 5. Baked Everything Possible
Pre-render lighting, pre-bake AO, pre-compute animations where possible. The best sites look expensive but run fast because the heavy computation happened at build time, not runtime.

### 6. Attention to Transitions
The space between sections matters as much as the sections themselves. Chromatic aberration during transitions, fog dissolves, particle dispersal -- these "in-between" moments are where the magic lives.

### 7. Performance as a Feature
"Blazing fast performance" was explicitly called out by the Awwwards jury for Igloo Inc. A beautiful experience that stutters is a bad experience. Adaptive quality, lazy loading, deferred shader compilation, and compressed assets are non-negotiable.

### 8. Blender as the Design Tool
Nearly every project uses Blender for 3D modeling and scene composition. The workflow is: design the camera path and environment in Blender, export to GLTF, recreate in Three.js with custom shaders.

---

## Sources

- [Awwwards Three.js Collection](https://www.awwwards.com/awwwards/collections/three-js/)
- [Awwwards Site of the Year 2024](https://www.awwwards.com/annual-awards-2024/site-of-the-year)
- [Awwwards Developer Site of the Year 2024](https://www.awwwards.com/annual-awards-2024/developer-site-of-the-year)
- [Igloo Inc Case Study](https://www.awwwards.com/igloo-inc-case-study.html)
- [Igloo Inc: Crystal Growth, Shader UI, Volume Data](https://www.webgpu.com/showcase/igloo-inc-procedural-crystals/)
- [David Whyte Experience Case Study](https://www.awwwards.com/case-study-david-whyte-experience-by-immersive-garden.html)
- [Sculpting Harmony -- Awwwards](https://www.awwwards.com/sculpting-harmony-wins-site-of-the-month-november-2023.html)
- [Hatom -- Awwwards SOTD](https://www.awwwards.com/sites/hatom)
- [Lusion Case Study](https://www.awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html)
- [Best Three.js Portfolio Examples 2025](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025)
- [Bruno Simon Case Study](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b)
- [How to Build Cinematic 3D Scroll Experiences with GSAP (Codrops)](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/)
- [Building Efficient Three.js Scenes (Codrops)](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
- [Distortion and Grain Effects on Scroll with Shaders (Codrops)](https://tympanus.net/codrops/2024/07/18/how-to-create-distortion-and-grain-effects-on-scroll-with-shaders-in-three-js/)
- [Scroll-Revealed WebGL Gallery (Codrops)](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/)
- [Scroll-Reactive 3D Gallery (Codrops)](https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/)
- [How I Built a Browser-Based Isometric RPG with Three.js](https://dev.to/mendolatech/how-i-built-a-browser-based-isometric-rpg-with-threejs-1j82)
- [Three.js-Interactive-Isometric (GitHub)](https://github.com/DanieloM83/THREE.js-Interactive-Isometric)
- [Baked Lighting in R3F](https://tchayen.github.io/posts/baked-lighting-in-r3f)
- [Custom Toon Shader in Three.js](https://www.maya-ndljk.com/blog/threejs-basic-toon-shader)
- [pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing)
- [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing)
- [Lenis Smooth Scroll](https://lenis.darkroom.engineering/)
- [r3f-scroll-rig (14islands)](https://github.com/14islands/r3f-scroll-rig)
- [drei ScrollControls](https://drei.docs.pmnd.rs/controls/scroll-controls)
- [React Three Fiber Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [Resn -- Sculpting Harmony Technical Details](https://the-brandidentity.com/project/with-type-that-moves-and-dances-resn-designs-the-sculpting-harmony-exhibition-to-dramatic-effect)
- [Lusion Studio](https://lusion.co/)
- [Immersive Garden](https://immersive-g.com/)
