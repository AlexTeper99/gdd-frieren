# Immersive 3D Foundation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the full 3D rendering architecture — a working isometric campsite with placeholder objects, particle system, day/night cycle, post-processing, HUD overlay, and accessibility fallback — validating every layer of the immersive experience spec.

**Architecture:** Persistent fullscreen R3F canvas (Layers 1-3: World, Particles, Arcane) with React DOM overlay (Layer 4: HUD). OrthographicCamera for isometric campsite view. GSAP for camera/scene animations. Framer Motion for UI micro-interactions. Day/night cycle driven by user's local time.

**Tech Stack:** @react-three/fiber, @react-three/drei, @react-three/postprocessing, three, gsap, lenis, howler

**Spec:** `docs/superpowers/specs/2026-03-25-immersive-experience-design.md`

**Scope:** This plan covers the 3D foundation only. Future plans: awakening sequence, object interactions (Fogata ritual flow, Grimorio book flip), journey map, audio layers.

---

## File Structure

### New files

```
app/(app)/
├── _components/
│   ├── canvas-world.tsx              # R3F Canvas wrapper, fullscreen, persistent
│   ├── campsite/
│   │   ├── campsite-scene.tsx        # Scene root: ground + objects + lights + camera
│   │   ├── ground-plane.tsx          # Isometric ground with clearing
│   │   ├── interactive-object.tsx    # Reusable clickable 3D object with hover/glow
│   │   ├── campsite-objects.tsx      # All 6 objects placed in scene (Fogata, Grimorio, etc.)
│   │   ├── firefly-particles.tsx     # PointsMaterial + simplex noise particle system
│   │   ├── sky-dome.tsx              # Hemisphere sky gradient (shader)
│   │   └── effects.tsx              # EffectComposer: bloom, DoF, vignette, grain, etc.
│   ├── hud/
│   │   ├── hud-overlay.tsx           # Fullscreen DOM overlay container (pointer-events:none)
│   │   ├── character-info.tsx        # Top-left: avatar + name + level
│   │   ├── stat-bars.tsx             # Stat bars (VIT/STR/INT/STA)
│   │   ├── streak-badge.tsx          # Top-right: streak fire + count
│   │   └── narrative-box.tsx         # Bottom-center: Frieren dialogue box
│   └── providers/
│       └── world-provider.tsx        # React context: time-of-day, atmosphere, selected object

lib/
├── world/
│   ├── types.ts                      # TimeOfDay, AtmosphereState, CampsiteObject enums/types
│   ├── constants.ts                  # Sky colors, light temps, camera config, object positions
│   ├── use-time-of-day.ts            # Hook: returns period + interpolated shader values
│   └── use-reduced-motion.ts         # Hook: respects prefers-reduced-motion for 3D

__tests__/
├── lib/world/
│   ├── use-time-of-day.test.ts       # Unit tests for time-of-day logic
│   └── constants.test.ts             # Validate constant ranges and types
├── app/
│   └── campsite/
│       ├── canvas-world.test.tsx      # Smoke test: canvas mounts
│       └── hud-overlay.test.tsx       # Smoke test: HUD renders
```

### Modified files

```
package.json                          # Add 3D dependencies
app/(app)/page.tsx                    # Replace placeholder with CanvasWorld + HudOverlay
app/globals.css                       # Add fullscreen canvas styles, HUD z-index tokens
next.config.ts                        # Add transpilePackages for three.js ecosystem
```

---

## Chunk 1: Dependencies, Types, Hooks & Canvas Scaffold

### Task 1: Install 3D dependencies

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Install R3F ecosystem + GSAP + utilities**

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis howler
npm install -D @types/three @types/howler
```

> **Note on GSAP:** The free `gsap` npm package includes ScrollTrigger but NOT SplitText (Club plugin, paid). SplitText is needed for typewriter effects in the awakening sequence (future plan). For this foundation plan, the free package is sufficient. Defer SplitText licensing decision to the awakening plan.

- [ ] **Step 2: Configure next.config.ts for Three.js transpilation**

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
};

export default nextConfig;
```

- [ ] **Step 3: Verify the app still builds**

Run: `npm run build`
Expected: Build succeeds (no import errors from new packages)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "chore: add 3D dependencies (R3F, Three.js, GSAP, Lenis, Howler)"
```

---

### Task 2: World types and constants

**Files:**
- Create: `lib/world/types.ts`
- Create: `lib/world/constants.ts`
- Test: `__tests__/lib/world/constants.test.ts`

- [ ] **Step 1: Write failing test for constants**

```ts
// __tests__/lib/world/constants.test.ts
import { describe, it, expect } from "vitest";
import {
  TIME_PERIODS,
  SKY_COLORS,
  LIGHT_TEMPS,
  CAMERA_CONFIG,
  OBJECT_POSITIONS,
} from "@/lib/world/constants";
import type { TimePeriod } from "@/lib/world/types";

describe("world constants", () => {
  it("defines all 5 time periods", () => {
    const periods: TimePeriod[] = ["night", "dawn", "day", "dusk", "evening"];
    periods.forEach((p) => {
      expect(TIME_PERIODS[p]).toBeDefined();
      expect(TIME_PERIODS[p].startHour).toBeGreaterThanOrEqual(0);
      expect(TIME_PERIODS[p].endHour).toBeLessThanOrEqual(24);
    });
  });

  it("defines sky colors for each period", () => {
    expect(Object.keys(SKY_COLORS)).toHaveLength(5);
  });

  it("defines light temperatures between 2000K and 6000K", () => {
    Object.values(LIGHT_TEMPS).forEach((temp) => {
      expect(temp).toBeGreaterThanOrEqual(2000);
      expect(temp).toBeLessThanOrEqual(6000);
    });
  });

  it("defines orthographic camera config", () => {
    expect(CAMERA_CONFIG.position).toHaveLength(3);
    expect(CAMERA_CONFIG.zoom).toBeGreaterThan(0);
  });

  it("defines positions for all 6 campsite objects", () => {
    const objects = ["fogata", "grimorio", "espejo", "mapa", "pergamino", "frieren"];
    objects.forEach((obj) => {
      expect(OBJECT_POSITIONS[obj]).toBeDefined();
      expect(OBJECT_POSITIONS[obj]).toHaveLength(3);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/lib/world/constants.test.ts`
Expected: FAIL — modules not found

- [ ] **Step 3: Create types**

```ts
// lib/world/types.ts
export type TimePeriod = "night" | "dawn" | "day" | "dusk" | "evening";

export type AtmosphereMode = "ethereal" | "arcane" | "cinematic";

export type CampsiteObjectId =
  | "fogata"
  | "grimorio"
  | "espejo"
  | "mapa"
  | "pergamino"
  | "frieren";

export interface TimePeriodConfig {
  startHour: number;
  endHour: number;
  label: string;
}

export interface WorldState {
  timePeriod: TimePeriod;
  atmosphereMode: AtmosphereMode;
  selectedObject: CampsiteObjectId | null;
}
```

- [ ] **Step 4: Create constants**

```ts
// lib/world/constants.ts
import type { TimePeriod, TimePeriodConfig, CampsiteObjectId } from "./types";

export const TIME_PERIODS: Record<TimePeriod, TimePeriodConfig> = {
  night:   { startHour: 0,  endHour: 6,  label: "Noche" },
  dawn:    { startHour: 6,  endHour: 9,  label: "Amanecer" },
  day:     { startHour: 9,  endHour: 17, label: "Día" },
  dusk:    { startHour: 17, endHour: 21, label: "Atardecer" },
  evening: { startHour: 21, endHour: 24, label: "Noche" },
};

// Sky gradient top/bottom colors per period (hex for Three.js Color)
export const SKY_COLORS: Record<TimePeriod, { top: string; bottom: string }> = {
  night:   { top: "#08081a", bottom: "#1a1a3e" },
  dawn:    { top: "#1a1a3e", bottom: "#f8a060" },
  day:     { top: "#4a7a9a", bottom: "#6a9a7a" },
  dusk:    { top: "#e94560", bottom: "#533483" },
  evening: { top: "#0e0e28", bottom: "#1a1840" },
};

// Light temperature in Kelvin per period
export const LIGHT_TEMPS: Record<TimePeriod, number> = {
  night:   2200,
  dawn:    3500,
  day:     5500,
  dusk:    2800,
  evening: 2400,
};

// Orthographic camera config for isometric view
export const CAMERA_CONFIG = {
  position: [10, 10, 10] as [number, number, number],
  zoom: 50,
  near: 0.1,
  far: 100,
};

// Object positions in 3D space (x, y, z) — isometric grid
export const OBJECT_POSITIONS: Record<CampsiteObjectId, [number, number, number]> = {
  fogata:    [0, 0, 0],
  grimorio:  [-2.5, 0, -1.5],
  espejo:    [2.5, 0, -1.5],
  mapa:      [1.5, 0, 2],
  pergamino: [-1.5, 0, 2],
  frieren:   [-1, 0, -0.5],
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run __tests__/lib/world/constants.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/world/ __tests__/lib/world/
git commit -m "feat(world): add types and constants for 3D world system"
```

---

### Task 3: Time-of-day hook

**Files:**
- Create: `lib/world/use-time-of-day.ts`
- Test: `__tests__/lib/world/use-time-of-day.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/world/use-time-of-day.test.ts
import { describe, it, expect } from "vitest";
import { getTimePeriod, getInterpolatedValues } from "@/lib/world/use-time-of-day";

describe("getTimePeriod", () => {
  it("returns night for 3am", () => {
    expect(getTimePeriod(3)).toBe("night");
  });

  it("returns dawn for 7am", () => {
    expect(getTimePeriod(7)).toBe("dawn");
  });

  it("returns day for 12pm", () => {
    expect(getTimePeriod(12)).toBe("day");
  });

  it("returns dusk for 19:00", () => {
    expect(getTimePeriod(19)).toBe("dusk");
  });

  it("returns evening for 22:00", () => {
    expect(getTimePeriod(22)).toBe("evening");
  });

  it("handles boundary at 0", () => {
    expect(getTimePeriod(0)).toBe("night");
  });

  it("handles boundary at 6", () => {
    expect(getTimePeriod(6)).toBe("dawn");
  });
});

describe("getInterpolatedValues", () => {
  it("returns sky colors for a given hour", () => {
    const values = getInterpolatedValues(12);
    expect(values.skyTop).toBeDefined();
    expect(values.skyBottom).toBeDefined();
    expect(values.lightTemp).toBeGreaterThan(0);
    expect(values.particleIntensity).toBeGreaterThanOrEqual(0);
    expect(values.particleIntensity).toBeLessThanOrEqual(1);
    expect(values.starsVisible).toBe(false);
  });

  it("shows stars at night", () => {
    const values = getInterpolatedValues(2);
    expect(values.starsVisible).toBe(true);
  });

  it("shows stars in evening", () => {
    const values = getInterpolatedValues(23);
    expect(values.starsVisible).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/lib/world/use-time-of-day.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement pure functions + hook**

```ts
// lib/world/use-time-of-day.ts
"use client";

import { useState, useEffect } from "react";
import type { TimePeriod } from "./types";
import { TIME_PERIODS, SKY_COLORS, LIGHT_TEMPS } from "./constants";

export interface TimeOfDayValues {
  period: TimePeriod;
  skyTop: string;
  skyBottom: string;
  lightTemp: number;
  particleIntensity: number;
  starsVisible: boolean;
  fogDensity: number;
}

export function getTimePeriod(hour: number): TimePeriod {
  for (const [period, config] of Object.entries(TIME_PERIODS)) {
    if (hour >= config.startHour && hour < config.endHour) {
      return period as TimePeriod;
    }
  }
  return "night";
}

export function getInterpolatedValues(hour: number): TimeOfDayValues {
  const period = getTimePeriod(hour);
  const colors = SKY_COLORS[period];
  const lightTemp = LIGHT_TEMPS[period];

  return {
    period,
    skyTop: colors.top,
    skyBottom: colors.bottom,
    lightTemp,
    particleIntensity: period === "night" || period === "evening" ? 0.8 : 0.3,
    starsVisible: period === "night" || period === "evening",
    fogDensity: period === "dawn" ? 0.8 : period === "dusk" ? 0.4 : 0.1,
  };
}

export function useTimeOfDay(): TimeOfDayValues {
  const [values, setValues] = useState<TimeOfDayValues>(() =>
    getInterpolatedValues(new Date().getHours())
  );

  useEffect(() => {
    const update = () => setValues(getInterpolatedValues(new Date().getHours()));
    // Update every minute
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  return values;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run __tests__/lib/world/use-time-of-day.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/world/use-time-of-day.ts __tests__/lib/world/use-time-of-day.test.ts
git commit -m "feat(world): add time-of-day hook with period detection and interpolation"
```

---

### Task 4: Reduced motion hook

**Files:**
- Create: `lib/world/use-reduced-motion.ts`

- [ ] **Step 1: Create the hook**

```ts
// lib/world/use-reduced-motion.ts
"use client";

import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/world/use-reduced-motion.ts
git commit -m "feat(world): add reduced-motion hook for accessibility"
```

---

### Task 5: World provider context

**Files:**
- Create: `app/(app)/_components/providers/world-provider.tsx`

- [ ] **Step 1: Create the provider**

```tsx
// app/(app)/_components/providers/world-provider.tsx
"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { useTimeOfDay, type TimeOfDayValues } from "@/lib/world/use-time-of-day";
import { useReducedMotion } from "@/lib/world/use-reduced-motion";
import type { AtmosphereMode, CampsiteObjectId } from "@/lib/world/types";

interface WorldContextValue {
  timeOfDay: TimeOfDayValues;
  atmosphereMode: AtmosphereMode;
  setAtmosphereMode: (mode: AtmosphereMode) => void;
  selectedObject: CampsiteObjectId | null;
  setSelectedObject: (id: CampsiteObjectId | null) => void;
  reducedMotion: boolean;
}

const WorldContext = createContext<WorldContextValue | null>(null);

export function WorldProvider({ children }: { children: ReactNode }) {
  const timeOfDay = useTimeOfDay();
  const reducedMotion = useReducedMotion();
  const [atmosphereMode, setAtmosphereMode] = useState<AtmosphereMode>("ethereal");
  const [selectedObject, setSelectedObject] = useState<CampsiteObjectId | null>(null);

  const value = useMemo(
    () => ({
      timeOfDay,
      atmosphereMode,
      setAtmosphereMode,
      selectedObject,
      setSelectedObject,
      reducedMotion,
    }),
    [timeOfDay, atmosphereMode, selectedObject, reducedMotion]
  );

  return (
    <WorldContext.Provider value={value}>
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld(): WorldContextValue {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error("useWorld must be used within WorldProvider");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(app)/_components/providers/world-provider.tsx
git commit -m "feat(world): add WorldProvider context for 3D state management"
```

---

### Task 6: Canvas world scaffold

**Files:**
- Create: `app/(app)/_components/canvas-world.tsx`
- Create: `app/(app)/_components/campsite/campsite-scene.tsx`
- Create: `app/(app)/_components/campsite/ground-plane.tsx`
- Create: `app/(app)/_components/campsite/sky-dome.tsx`

- [ ] **Step 1: Create sky dome component**

```tsx
// app/(app)/_components/campsite/sky-dome.tsx
"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useWorld } from "../providers/world-provider";

export function SkyDome() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { timeOfDay } = useWorld();

  const topColor = useMemo(() => new THREE.Color(timeOfDay.skyTop), [timeOfDay.skyTop]);
  const bottomColor = useMemo(() => new THREE.Color(timeOfDay.skyBottom), [timeOfDay.skyBottom]);

  return (
    <mesh ref={meshRef} scale={[50, 50, 50]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={{
          topColor: { value: topColor },
          bottomColor: { value: bottomColor },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition).y * 0.5 + 0.5;
            gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
          }
        `}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: Create ground plane**

```tsx
// app/(app)/_components/campsite/ground-plane.tsx
"use client";

export function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#1a2a1a"
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
}
```

- [ ] **Step 3: Create campsite scene (root)**

```tsx
// app/(app)/_components/campsite/campsite-scene.tsx
"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useWorld } from "../providers/world-provider";
import { CAMERA_CONFIG } from "@/lib/world/constants";
import { SkyDome } from "./sky-dome";
import { GroundPlane } from "./ground-plane";

export function CampsiteScene() {
  const { timeOfDay } = useWorld();
  const { position, zoom, near, far } = CAMERA_CONFIG;

  // Map light temp to a rough color (warm = orange, cool = white-blue)
  const lightColor = timeOfDay.lightTemp > 4000 ? "#ffffff" : "#ffd4a0";

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={position}
        zoom={zoom}
        near={near}
        far={far}
      />
      <SkyDome />
      <GroundPlane />
      {/* Ambient + directional light */}
      <ambientLight intensity={0.3} color={lightColor} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.7}
        color={lightColor}
      />
    </>
  );
}
```

- [ ] **Step 4: Create canvas world wrapper**

```tsx
// app/(app)/_components/canvas-world.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { CampsiteScene } from "./campsite/campsite-scene";
import { useWorld } from "./providers/world-provider";

export function CanvasWorld() {
  const { reducedMotion } = useWorld();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
    >
      <Canvas
        gl={{
          antialias: true,
          toneMapping: 4, // ACESFilmicToneMapping (3 = Cineon, 4 = ACES)
          outputColorSpace: "srgb",
        }}
        dpr={[1, 1.5]}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <CampsiteScene />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 5: Verify the app renders without errors**

Modify `app/(app)/page.tsx` temporarily to mount the canvas:

```tsx
// app/(app)/page.tsx
import { WorldProvider } from "./_components/providers/world-provider";
import { CanvasWorld } from "./_components/canvas-world";

// verifySession() is handled by app/(app)/layout.tsx — intentionally omitted here
export default function ElMundoPage() {
  return (
    <WorldProvider>
      <CanvasWorld />
    </WorldProvider>
  );
}
```

Run: `npm run dev` and open in browser.
Expected: A dark scene with a green ground plane and sky gradient. Isometric camera angle. No errors in console.

- [ ] **Step 6: Commit**

```bash
git add app/(app)/_components/canvas-world.tsx app/(app)/_components/campsite/ app/(app)/page.tsx
git commit -m "feat(world): scaffold R3F canvas with isometric campsite scene"
```

---

## Chunk 2: Campsite Objects, Particles, Post-Processing & HUD

### Task 7: Interactive campsite objects (placeholder geometry)

**Files:**
- Create: `app/(app)/_components/campsite/interactive-object.tsx`
- Create: `app/(app)/_components/campsite/campsite-objects.tsx`
- Modify: `app/(app)/_components/campsite/campsite-scene.tsx`

- [ ] **Step 1: Create reusable interactive object component**

```tsx
// app/(app)/_components/campsite/interactive-object.tsx
"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { CampsiteObjectId } from "@/lib/world/types";
import { useWorld } from "../providers/world-provider";

interface InteractiveObjectProps {
  id: CampsiteObjectId;
  position: [number, number, number];
  color: string;
  emissiveColor: string;
  geometry: "box" | "cylinder" | "sphere";
  scale?: [number, number, number];
  label: string;
}

export function InteractiveObject({
  id,
  position,
  color,
  emissiveColor,
  geometry,
  scale = [1, 1, 1],
  label,
}: InteractiveObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedObject, setSelectedObject, reducedMotion } = useWorld();
  const isSelected = selectedObject === id;

  useFrame((_, delta) => {
    if (!meshRef.current || reducedMotion) return;
    // Subtle hover float
    const targetY = hovered ? position[1] + 0.15 : position[1];
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      delta * 5
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={() => setSelectedObject(isSelected ? null : id)}
    >
      {geometry === "box" && <boxGeometry args={[0.6, 0.8, 0.6]} />}
      {geometry === "cylinder" && <cylinderGeometry args={[0.3, 0.3, 0.8]} />}
      {geometry === "sphere" && <sphereGeometry args={[0.4, 16, 16]} />}
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={hovered || isSelected ? 0.5 : 0.1}
        roughness={0.7}
      />
      {hovered && (
        <Html position={[0, 1.2, 0]} center>
          <div
            style={{
              background: "rgba(8,8,15,0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              padding: "4px 10px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              color: emissiveColor,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </mesh>
  );
}
```

- [ ] **Step 2: Create all campsite objects**

```tsx
// app/(app)/_components/campsite/campsite-objects.tsx
"use client";

import { InteractiveObject } from "./interactive-object";
import { OBJECT_POSITIONS } from "@/lib/world/constants";

export function CampsiteObjects() {
  return (
    <>
      <InteractiveObject
        id="fogata"
        position={OBJECT_POSITIONS.fogata}
        color="#5a3520"
        emissiveColor="#ff6b35"
        geometry="cylinder"
        scale={[1.2, 0.5, 1.2]}
        label="Fogata"
      />
      {/* Fire point light */}
      <pointLight
        position={[OBJECT_POSITIONS.fogata[0], 0.8, OBJECT_POSITIONS.fogata[2]]}
        color="#ff6b35"
        intensity={2}
        distance={6}
        decay={2}
      />

      <InteractiveObject
        id="grimorio"
        position={OBJECT_POSITIONS.grimorio}
        color="#3a1f6a"
        emissiveColor="#aa82ff"
        geometry="box"
        scale={[0.8, 1, 0.6]}
        label="Grimorio"
      />

      <InteractiveObject
        id="espejo"
        position={OBJECT_POSITIONS.espejo}
        color="#3a3a50"
        emissiveColor="#96b4ff"
        geometry="box"
        scale={[0.5, 1.2, 0.15]}
        label="Espejo"
      />

      <InteractiveObject
        id="mapa"
        position={OBJECT_POSITIONS.mapa}
        color="#5a4a35"
        emissiveColor="#f8c291"
        geometry="cylinder"
        scale={[0.8, 0.3, 0.8]}
        label="Mapa"
      />

      <InteractiveObject
        id="pergamino"
        position={OBJECT_POSITIONS.pergamino}
        color="#4a3a28"
        emissiveColor="#c8b496"
        geometry="cylinder"
        scale={[0.3, 0.9, 0.3]}
        label="Pergamino"
      />

      <InteractiveObject
        id="frieren"
        position={OBJECT_POSITIONS.frieren}
        color="#c0b8d0"
        emissiveColor="#c8b4ff"
        geometry="sphere"
        scale={[0.7, 1.2, 0.7]}
        label="Frieren"
      />
    </>
  );
}
```

- [ ] **Step 3: Add objects to campsite scene**

Add to the imports and JSX in `campsite-scene.tsx`:

```tsx
// Add import:
import { CampsiteObjects } from "./campsite-objects";

// Add inside the JSX return, after <GroundPlane />:
<CampsiteObjects />
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev`
Expected: 6 placeholder objects visible on the ground plane. Hovering shows label tooltip. Clicking selects (emissive glow). Cursor changes to pointer on hover.

- [ ] **Step 5: Commit**

```bash
git add app/(app)/_components/campsite/
git commit -m "feat(campsite): add 6 interactive placeholder objects with hover/select"
```

---

### Task 8: Firefly particle system

**Files:**
- Create: `app/(app)/_components/campsite/firefly-particles.tsx`
- Modify: `app/(app)/_components/campsite/campsite-scene.tsx`

- [ ] **Step 1: Create particle system**

```tsx
// app/(app)/_components/campsite/firefly-particles.tsx
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWorld } from "../providers/world-provider";

const PARTICLE_COUNT = 40;

export function FireflyParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { timeOfDay, reducedMotion } = useWorld();

  const { positions, offsets } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const off = new Float32Array(PARTICLE_COUNT); // random phase offsets
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;     // x
      pos[i * 3 + 1] = Math.random() * 3 + 0.5;     // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;  // z
      off[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, offsets: off };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const t = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phase = offsets[i];
      // Absolute position offset (not cumulative) to prevent drift
      posAttr.array[i * 3] = positions[i * 3] + Math.cos(t * 0.3 + phase) * 0.2;
      posAttr.array[i * 3 + 1] = positions[i * 3 + 1] + Math.sin(t * 0.5 + phase) * 0.3;
      posAttr.array[i * 3 + 2] = positions[i * 3 + 2] + Math.sin(t * 0.4 + phase * 1.3) * 0.2;
    }
    posAttr.needsUpdate = true;
  });

  if (reducedMotion) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffa0"
        transparent
        opacity={timeOfDay.particleIntensity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
```

- [ ] **Step 2: Add to campsite scene**

Add import and JSX to `campsite-scene.tsx`:

```tsx
import { FireflyParticles } from "./firefly-particles";
// Inside return, after <CampsiteObjects />:
<FireflyParticles />
```

- [ ] **Step 3: Verify visually**

Run: `npm run dev`
Expected: Glowing yellow dots floating gently above the ground. More visible at night/evening. No particles if `prefers-reduced-motion` is active.

- [ ] **Step 4: Commit**

```bash
git add app/(app)/_components/campsite/firefly-particles.tsx app/(app)/_components/campsite/campsite-scene.tsx
git commit -m "feat(campsite): add firefly particle system with day/night intensity"
```

---

### Task 9: Post-processing effects

**Files:**
- Create: `app/(app)/_components/campsite/effects.tsx`
- Modify: `app/(app)/_components/canvas-world.tsx`

- [ ] **Step 1: Create effects component**

```tsx
// app/(app)/_components/campsite/effects.tsx
"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
  TiltShift2,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { useWorld } from "../providers/world-provider";

export function Effects() {
  const { reducedMotion } = useWorld();

  if (reducedMotion) return null;

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={1}
        luminanceSmoothing={0.9}
        intensity={0.4}
      />
      <TiltShift2
        blur={0.1}
        taper={0.5}
      />
      <Vignette
        offset={0.3}
        darkness={0.4}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.03}
      />
      <ChromaticAberration
        offset={new Vector2(0.0005, 0.0005)}
        radialModulation
        modulationOffset={0.5}
      />
      {/* SMAA anti-aliasing is applied by default via EffectComposer */}
      {/* TODO: Color Grading — warm LUT texture needed from art pipeline */}
    </EffectComposer>
  );
}
```

- [ ] **Step 2: Add effects to canvas world**

Add import and JSX to `canvas-world.tsx`, inside `<Canvas>` after `<CampsiteScene />`:

```tsx
import { Effects } from "./campsite/effects";
// Inside <Canvas>, after <CampsiteScene />:
<Effects />
```

- [ ] **Step 3: Verify visually**

Run: `npm run dev`
Expected: Scene now has subtle bloom around the fire light, tilt-shift blur at edges, vignette darkening corners, faint grain texture, and chromatic aberration at edges. Should feel cinematic.

- [ ] **Step 4: Commit**

```bash
git add app/(app)/_components/campsite/effects.tsx app/(app)/_components/canvas-world.tsx
git commit -m "feat(campsite): add post-processing stack (bloom, tilt-shift, vignette, grain)"
```

---

### Task 10: HUD overlay

**Files:**
- Create: `app/(app)/_components/hud/hud-overlay.tsx`
- Create: `app/(app)/_components/hud/character-info.tsx`
- Create: `app/(app)/_components/hud/stat-bars.tsx`
- Create: `app/(app)/_components/hud/streak-badge.tsx`
- Create: `app/(app)/_components/hud/narrative-box.tsx`
- Modify: `app/(app)/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add global CSS tokens for HUD**

Append to `app/globals.css`:

```css
/* === 3D World Layers === */
.world-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.hud-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  max-width: 480px;
  margin: 0 auto;
}

.hud-overlay > * {
  pointer-events: auto;
}

.hud-chip {
  background: oklch(0.15 0.01 260 / 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid oklch(1 0 0 / 0.06);
  border-radius: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}
```

- [ ] **Step 2: Create character info component**

```tsx
// app/(app)/_components/hud/character-info.tsx
"use client";

export function CharacterInfo() {
  // TODO: pull from user state/DB — hardcoded for scaffold
  return (
    <div className="flex items-center gap-3">
      <div className="hud-chip flex items-center gap-2">
        <span className="text-[#f8c291]">Nv.1</span>
        <span className="text-white/30 text-xs">Aprendiz</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create stat bars component**

```tsx
// app/(app)/_components/hud/stat-bars.tsx
"use client";

const STATS = [
  { key: "VIT", value: 50, color: "#6aff6a" },
  { key: "STR", value: 40, color: "#ff6a6a" },
  { key: "INT", value: 60, color: "#6ab4ff" },
  { key: "STA", value: 45, color: "#ffc86a" },
] as const;

export function StatBars() {
  return (
    <div className="flex flex-col gap-1 mt-1">
      {STATS.map((stat) => (
        <div key={stat.key} className="flex items-center gap-1.5">
          <span
            className="font-mono text-[10px] w-7 text-right uppercase"
            style={{ color: stat.color, opacity: 0.7 }}
          >
            {stat.key}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${stat.value}%`,
                background: `linear-gradient(90deg, ${stat.color}66, ${stat.color})`,
                boxShadow: `0 0 6px ${stat.color}33`,
              }}
            />
          </div>
          <span className="font-mono text-[10px] text-white/25 w-5">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create streak badge**

```tsx
// app/(app)/_components/hud/streak-badge.tsx
"use client";

export function StreakBadge() {
  // TODO: pull from user state/DB
  const streak = 1;

  return (
    <div className="hud-chip flex items-center gap-1.5">
      <span className="text-sm">🔥</span>
      <span className="font-mono text-sm font-semibold text-[#ff8c50]">
        {streak}
      </span>
      <span className="font-mono text-[10px] text-white/25 uppercase tracking-wider">
        Racha
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Create narrative box**

```tsx
// app/(app)/_components/hud/narrative-box.tsx
"use client";

export function NarrativeBox() {
  // TODO: connect to narrative state — hardcoded for scaffold
  return (
    <div className="hud-chip rounded-xl p-3 flex gap-3 items-start max-w-sm mx-auto">
      <div className="w-8 h-8 rounded-lg bg-[#aa82ff]/10 border border-[#aa82ff]/15 flex items-center justify-center text-sm shrink-0">
        ✨
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10px] text-[#aa82ff]/50 uppercase tracking-wider mb-1">
          Frieren
        </div>
        <div className="text-sm text-[#dcd7eb]/85 italic leading-relaxed">
          &quot;Los que no entrenan su magia a diario... la pierden sin darse
          cuenta.&quot;
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create HUD overlay container**

```tsx
// app/(app)/_components/hud/hud-overlay.tsx
"use client";

import { CharacterInfo } from "./character-info";
import { StatBars } from "./stat-bars";
import { StreakBadge } from "./streak-badge";
import { NarrativeBox } from "./narrative-box";

export function HudOverlay() {
  return (
    <div className="hud-overlay">
      {/* Top row */}
      <div className="flex justify-between items-start">
        <div>
          <CharacterInfo />
          <StatBars />
        </div>
        <StreakBadge />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: narrative */}
      <NarrativeBox />
    </div>
  );
}
```

- [ ] **Step 7: Wire everything into El Mundo page**

```tsx
// app/(app)/page.tsx
import { WorldProvider } from "./_components/providers/world-provider";
import { CanvasWorld } from "./_components/canvas-world";
import { HudOverlay } from "./_components/hud/hud-overlay";

// verifySession() is handled by app/(app)/layout.tsx — intentionally omitted here
export default function ElMundoPage() {
  return (
    <WorldProvider>
      <CanvasWorld />
      <HudOverlay />
    </WorldProvider>
  );
}
```

- [ ] **Step 8: Verify visually**

Run: `npm run dev`
Expected: Full immersive view — isometric campsite with 6 glowing objects, fireflies, post-processing, sky gradient. HUD overlay shows character info + stat bars (top left), streak badge (top right), Frieren narrative box (bottom center). HUD is constrained to 480px centered. Canvas fills viewport.

- [ ] **Step 9: Commit**

```bash
git add app/(app)/_components/hud/ app/(app)/page.tsx app/globals.css
git commit -m "feat(hud): add game-style HUD overlay with stats, streak, and narrative box"
```

---

### Task 11: Smoke tests

**Files:**
- Create: `__tests__/app/campsite/canvas-world.test.tsx`
- Create: `__tests__/app/campsite/hud-overlay.test.tsx`

- [ ] **Step 1: Write canvas smoke test**

```tsx
// __tests__/app/campsite/canvas-world.test.tsx
import { describe, it, expect, vi } from "vitest";

// Mock R3F Canvas since jsdom has no WebGL
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: any }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}));

vi.mock("@react-three/drei", () => ({
  OrthographicCamera: () => null,
  Html: ({ children }: { children: any }) => <div>{children}</div>,
  Environment: () => null,
}));

vi.mock("@react-three/postprocessing", () => ({
  EffectComposer: ({ children }: { children: any }) => <>{children}</>,
  Bloom: () => null,
  Vignette: () => null,
  Noise: () => null,
  ChromaticAberration: () => null,
  TiltShift2: () => null,
}));

vi.mock("postprocessing", () => ({
  BlendFunction: { NORMAL: 0, ADD: 1 },
}));

import { render, screen } from "@testing-library/react";
import { CanvasWorld } from "@/app/(app)/_components/canvas-world";
import { WorldProvider } from "@/app/(app)/_components/providers/world-provider";

describe("CanvasWorld", () => {
  it("mounts without crashing", () => {
    render(
      <WorldProvider>
        <CanvasWorld />
      </WorldProvider>
    );
    expect(screen.getByTestId("r3f-canvas")).toBeDefined();
  });
});
```

- [ ] **Step 2: Write HUD smoke test**

```tsx
// __tests__/app/campsite/hud-overlay.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HudOverlay } from "@/app/(app)/_components/hud/hud-overlay";

describe("HudOverlay", () => {
  it("renders character level", () => {
    render(<HudOverlay />);
    expect(screen.getByText("Nv.1")).toBeDefined();
  });

  it("renders stat bars", () => {
    render(<HudOverlay />);
    expect(screen.getByText("VIT")).toBeDefined();
    expect(screen.getByText("STR")).toBeDefined();
    expect(screen.getByText("INT")).toBeDefined();
    expect(screen.getByText("STA")).toBeDefined();
  });

  it("renders streak badge", () => {
    render(<HudOverlay />);
    expect(screen.getByText("Racha")).toBeDefined();
  });

  it("renders narrative box with Frieren", () => {
    render(<HudOverlay />);
    expect(screen.getByText("Frieren")).toBeDefined();
  });
});
```

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All existing tests pass + new tests pass.

- [ ] **Step 4: Commit**

```bash
git add __tests__/app/campsite/
git commit -m "test: add smoke tests for CanvasWorld and HudOverlay"
```

---

## Summary

After completing this plan you will have:

1. **R3F canvas** — fullscreen persistent Three.js scene
2. **Isometric campsite** — OrthographicCamera, ground plane, sky gradient shader
3. **6 interactive objects** — Fogata, Grimorio, Espejo, Mapa, Pergamino, Frieren (placeholder geometry with hover/select)
4. **Firefly particles** — additive blending, simplex-like motion, day/night intensity
5. **Post-processing** — bloom, tilt-shift DoF, vignette, grain, chromatic aberration (disabled with prefers-reduced-motion)
6. **Day/night cycle** — 5 time periods with sky, lighting, and particle changes
7. **HUD overlay** — character info, stat bars, streak badge, narrative box (480px centered DOM)
8. **World state management** — React context with time-of-day, atmosphere mode, selected object
9. **Accessibility** — reduced motion support, demand rendering mode
10. **Tests** — unit tests for hooks/constants + smoke tests for components

**Not in this plan (future):** Blender models (replacing placeholder geometry), awakening sequence, object-specific interactions, journey map, audio layers, GSAP timeline integration, accessibility hit targets for screen readers.
