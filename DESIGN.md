---
name: Liquid Glass Dark UI
theme: Dark Liquid/Fluid Glassmorphism
platforms:
  desktop: macOS UI Paradigm
  tablet: iPadOS UI Paradigm
  mobile: iOS UI Paradigm
colors:
  surface: '#0b0f19'
  surface-dim: '#05070c'
  surface-bright: '#161e2e'
  glass-bg-primary: 'rgba(255, 255, 255, 0.04)'
  glass-bg-secondary: 'rgba(255, 255, 255, 0.08)'
  glass-bg-active: 'rgba(255, 255, 255, 0.12)'
  glass-border: 'rgba(255, 255, 255, 0.12)'
  glass-border-highlight: 'rgba(255, 255, 255, 0.25)'
  glass-glow: 'rgba(120, 170, 255, 0.15)'
  on-surface: '#f3f4f6'
  on-surface-variant: '#9ca3af'
  accent-primary: '#3b82f6'
  accent-glow: '#60a5fa'
  accent-cyan: '#06b6d4'
  accent-purple: '#a855f7'
typography:
  font-heading: Plus Jakarta Sans, SF Pro Display, system-ui
  font-body: Inter, SF Pro Text, system-ui
  font-mono: JetBrains Mono, Fira Code, monospace
rounded:
  pill: 9999px
  card-xl: 24px
  card-lg: 16px
  card-md: 12px
---

# Design System Architecture: 5EVEN Dark Liquid Glass

## 1. Design Vision & Visual Theme

The **5EVEN** platform is built on a high-fidelity **Dark Liquid/Fluid Glassmorphism** aesthetic. The design mimics depth, refraction, specular highlights, and ambient luminance found in modern OS environments:
- **Desktop**: macOS Big Sur/Sonoma window styling, translucency, floating docks, and refined window control interactions.
- **Tablet**: iPadOS fluid multi-touch drawer structures, split views, and pill-based navigation layouts.
- **Mobile**: iOS dynamic glass sheets, tactile haptic feedback cues, bottom-anchored control surfaces, and sleek floating elements.

### Core Glass Principles
- **Backdrop Blur**: Dual-layer blur (`backdrop-filter: blur(24px) saturate(180%)`) combined with semi-transparent dark tint (`rgba(11, 15, 25, 0.65)`).
- **Specular Borders**: Gradient borders with high opacity top-left (`rgba(255,255,255,0.2)`) fading to low opacity bottom-right (`rgba(255,255,255,0.03)`).
- **Ambient Lighting**: Underlying glowing orbs (`rgba(59, 130, 246, 0.15)` and `rgba(168, 85, 247, 0.15)`) diffusing softly through transparent surface layers.

---

## 2. Global Navigation Bar (Top Floating)

The navigation bar floats fixed at the top of the screen with liquid expansion/shrink dynamics upon scroll and interaction.

### Layout & Composition
`[ ( Logo ) < Home - Services (tooltip) - IT (tooltip) - Stars (tooltip) > ( Account Avatar ) ]`

- **Container Structure**:
  - Top floating layout with rounded pill shape (`border-radius: 9999px`).
  - Dark glass background (`rgba(15, 23, 42, 0.6)`), dynamic border (`1px solid rgba(255, 255, 255, 0.12)`), drop shadow (`0 20px 40px rgba(0,0,0,0.5)`).
  - Transition state: Shrinks in height (`64px` to `48px`) and tightens lateral margins on down-scroll. Expands smoothly on hover or idle scroll up.

- **Navigation Items & Tooltips**:
  - **Home**: Direct link to primary landing section.
  - **Services**: Includes trigger dropdown `Services ( > )` expanding to sub-menu:
    - `Academics`
    - `Courses`
    - `Notes`
    - *Tooltip Note*: `"5EVEN Core services"`
  - **IT**: Direct link to enterprise solutions.
    - *Tooltip Note*: `"All the IT Services we provide"`
  - **Stars**: Community and testimonial showcase.
    - *Tooltip Note*: `"How others are benefited from us ?"`

- **Account Avatar**:
  - Right-aligned profile icon encapsulated in a liquid glowing ring container (`2px` border with light sheen, hover glow effect).

---

## 3. Hero Section Architecture

The Hero Section is a high-impact, interactive video-backed multi-slide carousel featuring dynamic fluid animations and liquid glass framing.

### Background Media Layer
- **Assets**: Looping video files (`.mp4`/`.webm`) situated inside the assets directory.
- **Styling**: `opacity: 0.5` (50%), `object-fit: cover`, hardware-accelerated playback with overlay radial gradient vignette (`rgba(11, 15, 25, 0.4)` to `#0b0f19`) to ensure legibility.

### Floating Header Pill
- **Position**: Top center, floating fixed over the hero section slider.
- **Content**: `[ 5EVEN ]`
- **Style**: Ultra-clear glass capsule, minimal border glow, subtle backdrop filter.

### Slider Layout (3-Part Animated Layout)
Every slide follows a synchronized 3-part layout with distinct entering animations upon transition:

1. **Left Part**: Slide Title & Subtitle.
   - *Animation*: Dynamic translation from extreme left (`-100px` $\rightarrow$ `0px`) with blur fade-in.
2. **Right Part**: Highlighted Bordered Container with Glassmorphism Background.
   - *Animation*: Dynamic translation from extreme right (`+100px` $\rightarrow$ `0px`) with frosted glass sheen reveal.
3. **Bottom Part**: Interactive Action Bar (CTA Buttons).
   - *Animation*: Slide up from bottom (`+50px` $\rightarrow$ `0px`) with synchronized staggered fade-in.

---

## 4. Hero Slider Content Specifications

### Slide 1: Computational Engineering & IT
- **Left**:
  - **Large Title**: *Beyond the Limits of Computation.*
  - **Subtitle**: *From mathematical complexity and computer vision to supercomputing, quantum physics, and enterprise IT solutions — we engineer ideas, explore computational frontiers, and transform complex challenges into technological possibilities.*
- **Right**:
  - Graphic Media Asset: `slide 1.png` inside glass panel container.
- **Bottom**:
  - **CTA Primary**: `Explore Our Capabilities →` (Glowing liquid button filled with dynamic light sweep)
  - **CTA Secondary**: `Discover Our IT Services` (Glass frosted outlined button)

---

### Slide 2: Academic & Educational Ecosystem
- **Left**:
  - **Large Title**: *Building Minds. Shaping Generations.*
  - **Subtitle**: *Education is the foundation upon which societies evolve. At 5EVEN, we provide structured academic support, conceptual clarity, and intellectual guidance to learners from school education to higher studies — nurturing curiosity, confidence, and lifelong learning.*
- **Right**:
  - Graphic Media Asset: `slide 2.png` inside glass panel container.
- **Bottom**:
  - **CTA Primary**: `Dive into Academic Programs →`
  - **CTA Secondary**: `Begin Your Learning Journey`

---

### Slide 3: Research & Publications
- **Left**:
  - **Large Title**: *For Minds That Question Everything.*
  - **Subtitle**: *We believe every profound discovery begins with a question. Through independent research, academic publications, interdisciplinary exploration, and critical inquiry, 5EVEN cultivates thoughtful minds committed to challenging assumptions and expanding the boundaries of human understanding.*
- **Right**:
  - Graphic Media Asset: `slide 3.png` / `book cover.png` featured inside elevated frosted glass showcase frame.
- **Bottom**:
  - **CTA Primary**: `Explore Our Research →`
  - **CTA Secondary**: `Read Publications`

---

### Slide 4: Publication Spotlight ("Coffee with C")
- **Left**:
  - **Subtitle 1**: *For Those Who Invest in Understanding.*
  - **Title**: *Coffee with C*
  - **Subtitle 2**: *An exercise in precision, logic, and the art of programming. Fifteen carefully composed chapters, designed to make every page count.*
- **Right**:
  - Graphic Showcase Frame (Custom book asset display or interactive chapter viewer).
- **Bottom**:
  - **CTA Primary**: `Prebook →`
  - **CTA Secondary**: `Unload your writtings`

---

## 5. Responsive OS Component Mapping

| UI Element | Desktop (macOS UI) | Tablet (iPad UI) | Mobile (iOS UI) |
| :--- | :--- | :--- | :--- |
| **Navbar** | Floating dock style, full inline menu with rich hover tooltips | Compact top bar, tap-to-expand glass popover menu | Bottom-anchored or top floating glass capsule with gesture tray |
| **Hero Layout** | Dual-column side-by-side (Left 50%, Right 50%) + Bottom CTA bar | Split 60/40 visual stack with touch-swipe carousel triggers | Single vertical stack (Left text $\rightarrow$ Right visual $\rightarrow$ Bottom CTAs) |
| **Tooltips** | Hover state with delay & smooth opacity transition | Tap-and-hold trigger popover glass bubble | Sheet modal or bottom pop-up contextual pill |
| **Glass Quality** | Heavy multi-pass backdrop blur (`30px`), crisp hairline border | Medium backdrop blur (`20px`), soft touch shadows | High opacity glass (`backdrop-filter: blur(15px)`), optimized for performance |
```

The updated `DESIGN.md` file contains the revised design system details. Let me know if you need any adjustments to the slide details or styling rules!