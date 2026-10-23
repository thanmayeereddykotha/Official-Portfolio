# Contributing & Development Guide

Welcome to the development guide for the Thanmayee Reddy Kotha Official Portfolio repository.

## Local Development Workflow

1. **Clone the repository:**
   ```bash
   git clone git@github.com:thanmayeereddykotha/Official-Portfolio.git
   cd Official-Portfolio
   ```

2. **Start the local static server:**
   ```bash
   python3 -m http.server 3000 --bind 127.0.0.1
   ```
   Open `http://127.0.0.1:3000` in your web browser.

## Code Standards

- **3D Spline Canvas**: Ensure all keyframe animations, camera moves, and materials are tested for WebGL and WebGPU compatibility.
- **GSAP Timelines**: Keep timelines performant; always specify explicit easing curves (`power3.out`, `power4.inOut`).
- **Assets Organization**:
  - `assets/images/`: Optimized `.png`, `.jpg`, `.avif` assets with explicit 1:1 or 16:9 aspect ratios.
  - `assets/videos/`: Compressed MP4 streams for hover interactions.
  - `assets/models/`: Local `.splinecode` scenes.

## Commit Conventions

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) format:
- `feat`: New feature or interactive capability.
- `fix`: Bug fix or browser glitch resolution.
- `style`: Aesthetic, CSS, or typography adjustment.
- `perf`: Load time, rendering, or memory optimization.
- `docs`: Documentation updates.
