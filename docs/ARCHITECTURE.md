# Portfolio System Architecture

This document outlines the architectural structure, component lifecycle, and rendering pipelines of the Thanmayee Reddy Kotha Official Portfolio.

## Architecture Overview

```
+-------------------------------------------------------------------------+
|                              Document Root                              |
+-------------------------------------------------------------------------+
                                     |
         +---------------------------+---------------------------+
         |                                                       |
+------------------+                                   +------------------+
|  Luxury Loader   |                                   |  Spline 3D Hero  |
|  - GSAP counter  |                                   |  - WebGPU/WebGL  |
|  - 000% to 100%  | ===== (hero:revealed event) =====>|  - Start Proxy   |
|  - Veil teardown |                                   |  - Waterfall Drop|
+------------------+                                   +------------------+
                                                                 |
                                                                 v
+-------------------------------------------------------------------------+
|                            Interactive Desk                             |
|  - Monitor Click  ==> Smooth Camera Zoom & Section Reveal               |
|  - MacBook Click  ==> Direct Navigation to Projects Grid                |
+-------------------------------------------------------------------------+
                                     |
         +---------------------------+---------------------------+
         |                                                       |
+------------------+                                   +------------------+
| Dynamic Navbar   |                                   | Projects Grid    |
| - Top on Hero    |                                   | - Splide Slider  |
| - Floating Dock  |                                   | - Hover Playback |
+------------------+                                   | - 1:1 & 16:9     |
                                                       +------------------+
                                                                 |
                                                       +------------------+
                                                       | My Approach      |
                                                       | - Fixed Matrix   |
                                                       | - Curated Data   |
                                                       | - Modal Overlay  |
                                                       +------------------+
```

## Core Modules

### 1. Luxury Loader (`assets/js/luxury-loader.js`)
- Manages pre-render visual state with a pure white luxury aesthetic.
- Progressively tracks asset buffer compilation from `000%` to `100%`.
- Emits authoritative `hero:revealed` event upon complete DOM veil removal.

### 2. Spline 3D Hero Runtime (`assets/js/spline-hero.js`)
- Loads local Spline scene (`assets/models/spline/scene.splinecode`).
- Employs an internal `Proxy` interceptor on `_eventManager.handlers.Start` to prevent premature drop animations during background preloading.
- Fires waterfall drop animation strictly once after veil exit.
- Binds Raycast click interactions on 3D desk objects (Monitor, MacBook).

### 3. Projects Showcase & Media Controller (`assets/js/screenpal-hover.js`)
- Controls project card lifecycle across responsive viewports.
- Alternates aspect ratios: Square (1:1) and Widescreen (16:9).
- Manages instantaneous hover video playback with calibrated playheads.

### 4. My Approach Data Matrix
- Curated multi-channel business intelligence and quantitative dashboard gallery.
- Deterministic 3D translations locked to calibrated coordinates.
- Fully responsive modal overlay with blur backdrop and keyboard accessibility.
