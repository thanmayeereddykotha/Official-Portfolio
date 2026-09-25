/**
 * Thanmayee Portfolio - Interactive 3D Model Viewport
 * Powered by Three.js & GLTFLoader
 * Supports custom GLB/GLTF models placed at ./assets/model.glb or ./assets/models/model.glb
 */

(function () {
  const container = document.getElementById('hero3dContainer');
  const canvas = document.getElementById('hero3dCanvas');
  const statusEl = document.getElementById('modelStatusText');

  if (!container || !canvas || typeof THREE === 'undefined') {
    return;
  }

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.2, 5.5);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('WebGL context initialization failed or disabled:', err);
    if (statusEl) statusEl.textContent = '3D Viewport in Fallback Mode';
    return;
  }
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Orbit controls
  let controls;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 9;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
  }

  // Lighting - Crisp Monochromatic Architecture
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xcccccc, 1.2);
  fillLight.position.set(-6, -3, -4);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xffffff, 2.0, 15);
  rimLight.position.set(0, 4, -3);
  scene.add(rimLight);

  // Group for rotating objects
  const pivotGroup = new THREE.Group();
  scene.add(pivotGroup);

  // Attempt to load GLTF model from assets/model.glb
  let customModelLoaded = false;
  const modelPaths = ['./assets/model.glb', './assets/models/model.glb'];

  function tryLoadModel(index) {
    if (index >= modelPaths.length || typeof THREE.GLTFLoader === 'undefined') {
      createProceduralDataCore();
      return;
    }

    const path = modelPaths[index];

    // Check availability first to keep console clean without 404 noise
    fetch(path, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) {
          tryLoadModel(index + 1);
          return;
        }
        const loader = new THREE.GLTFLoader();
        loader.load(
          path,
          (gltf) => {
            customModelLoaded = true;
            const model = gltf.scene;

            // Auto center and scale
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.4 / (maxDim || 1);

            model.position.sub(center);
            model.scale.multiplyScalar(scale);

            pivotGroup.add(model);
            if (statusEl) {
              statusEl.textContent = 'Custom 3D Model Loaded • Drag to Orbit';
            }
          },
          undefined,
          () => tryLoadModel(index + 1)
        );
      })
      .catch(() => tryLoadModel(index + 1));
  }

  // Procedural Data & Business Analytics Geometry Fallback
  function createProceduralDataCore() {
    // 1. Central Icosahedron Crystal
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f1510,
      emissive: 0x112b18,
      roughness: 0.2,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    pivotGroup.add(coreMesh);

    // 2. Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xbefda7,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const wireMesh = new THREE.Mesh(coreGeo, wireMat);
    wireMesh.scale.setScalar(1.002);
    pivotGroup.add(wireMesh);

    // 3. Orbital Data Rings
    const ringGeo1 = new THREE.TorusGeometry(1.9, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xbefda7,
      emissive: 0xbefda7,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    pivotGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.3, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      transparent: true,
      opacity: 0.5
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    pivotGroup.add(ring2);

    // 4. Data Nodes (Floating particles)
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.4 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Gradient colors: brand green #BEFDA7 to white
      if (Math.random() > 0.3) {
        colors[i * 3] = 0.745;
        colors[i * 3 + 1] = 0.992;
        colors[i * 3 + 2] = 0.655;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    pivotGroup.add(particles);

    if (statusEl) {
      statusEl.textContent = 'Interactive 3D Data Lattice • Drag to Orbit';
    }
  }

  tryLoadModel(0);

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (controls) {
      controls.update();
    } else {
      pivotGroup.rotation.y += delta * 0.3;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  function handleResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', handleResize);
})();
