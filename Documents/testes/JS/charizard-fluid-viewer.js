/* =========================================================
   FORJ3D — "Quem somos": visualizador 3D com navegação em órbita
   Modelo estático (sem esqueleto/ossos), já na pose final.
   Vanilla JS + Three.js (via importmap, sem build/bundler).
   ========================================================= */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {
  const container = document.getElementById('charizardFluid');
  const canvas = document.getElementById('charizardFluidCanvas');
  const hint = document.getElementById('charizardHint');
  if (!container || !canvas) return;

  let started = false;

  function init() {
    if (started) return;
    started = true;

    // Já baixado na pasta GLB do projeto.
    const MODEL_PATH = 'GLB/charizard.glb';

    // Se o modelo aparecer deitado/de cabeça pra baixo, ajuste estes graus.
    const MODEL_ROTATION_DEG = { x: 0, y: 0, z: 0 };

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 4.2);

    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xff6a3d, 1.0);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    const headLight = new THREE.DirectionalLight(0xffffff, 1.4);
    headLight.position.set(0, 0, 0);
    camera.add(headLight);
    const headLightTarget = new THREE.Object3D();
    headLightTarget.position.set(0, 0, -1);
    camera.add(headLightTarget);
    headLight.target = headLightTarget;
    scene.add(camera);

    // ---------- navegação em órbita ----------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false; // zoom desativado — só rotação
    controls.minPolarAngle = Math.PI * 0.12;   // não deixa olhar de baixo pra cima demais
    controls.maxPolarAngle = Math.PI * 0.85;   // nem virar de cabeça por cima
    controls.rotateSpeed = 0.75;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.update();

    // pausa a rotação automática enquanto o visitante interage e retoma
    // depois de um instante parado
    let resumeAutoRotateTimer = null;
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
      hideHint();
      if (resumeAutoRotateTimer) clearTimeout(resumeAutoRotateTimer);
    });
    controls.addEventListener('end', () => {
      if (resumeAutoRotateTimer) clearTimeout(resumeAutoRotateTimer);
      resumeAutoRotateTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 1200);
    });

    function hideHint() {
      hint?.classList.add('charizard-hint-hidden');
    }

    function normalize(object) {
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.1 / maxAxis;
      object.scale.setScalar(scale);
      object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    }

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.loadAsync(MODEL_PATH).then((gltf) => {
      const model = gltf.scene;

      model.rotation.set(
        THREE.MathUtils.degToRad(MODEL_ROTATION_DEG.x),
        THREE.MathUtils.degToRad(MODEL_ROTATION_DEG.y),
        THREE.MathUtils.degToRad(MODEL_ROTATION_DEG.z)
      );
      model.updateMatrixWorld(true);

      // normalize() calcula escala/centralização DEPOIS da rotação acima,
      // então a centralização é sempre correta pra pose final.
      normalize(model);

      model.traverse((child) => {
        if (!child.isMesh) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if ('roughness' in mat) mat.roughness = 0.55;
        });
      });

      scene.add(model);
    }).catch((err) => {
      console.error('[charizard-fluid] falha ao carregar o modelo 3D:', err);
    });

    // ---------- loop (só roda enquanto a seção está visível) ----------
    let rafId = null;
    let isRunning = false;

    function frame() {
      rafId = requestAnimationFrame(frame);
      controls.update(); // necessário por causa do damping e do autoRotate
      renderer.render(scene, camera);
    }

    function play() {
      if (isRunning) return;
      isRunning = true;
      frame();
    }

    function pause() {
      isRunning = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    play();

    if ('IntersectionObserver' in window) {
      const playObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && document.visibilityState === 'visible') {
              play();
            } else {
              pause();
            }
          });
        },
        { threshold: 0.01 }
      );
      playObserver.observe(container);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pause();
      } else if (container.getBoundingClientRect().bottom > 0) {
        play();
      }
    });

    // ---------- resize ----------
    function handleResize() {
      width = container.clientWidth;
      height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);
    if (window.ResizeObserver) {
      new ResizeObserver(handleResize).observe(container);
    }
  } // fim de init()

  // ---------- carregamento sob demanda ----------
  // só inicializa o Three.js e baixa o .glb quando a seção "quem somos"
  // estiver perto de entrar na tela E o visitante já tiver aceitado
  // o banner de cookies (o que vier depois, dispara o init()).
  let inView = false;
  let consentGiven = window.forj3dHasConsent ? window.forj3dHasConsent() : true;

  function tryInit() {
    if (inView && consentGiven) init();
  }

  if (!consentGiven) {
    container.classList.add('media-gated');
    document.addEventListener('forj3d:consent-accepted', () => {
      consentGiven = true;
      container.classList.remove('media-gated');
      tryInit();
    }, { once: true });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            inView = true;
            tryInit();
            observer.disconnect();
          }
        });
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(container);
  } else {
    inView = true;
    tryInit();
  }
})();
