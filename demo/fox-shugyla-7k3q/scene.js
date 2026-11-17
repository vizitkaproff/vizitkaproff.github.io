import * as THREE from "three";

// Пастельные шарики мороженого и тапиока плавают на фоне
export function start(canvas) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 14;
  camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);

  scene.add(new THREE.HemisphereLight(0xfff6ee, 0xffc2d4, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 6, 8); scene.add(key);

  const sphere = new THREE.SphereGeometry(1, 40, 28);
  const palette = [
    { c: 0xffb3c8, r: 0.55, s: [0.7, 1.3] },  // клубничное
    { c: 0xfff1d6, r: 0.6, s: [0.7, 1.2] },   // ванильное
    { c: 0xb8ead1, r: 0.55, s: [0.6, 1.0] },  // мятное
    { c: 0xffd08a, r: 0.5, s: [0.6, 1.0] },   // манго
    { c: 0x4a2a22, r: 0.18, s: [0.25, 0.45] }, // тапиока
    { c: 0x4a2a22, r: 0.18, s: [0.25, 0.45] },
  ];
  const bits = [];
  const N = innerWidth < 700 ? 14 : 26;
  // ширина видимой области на глубине z, чтобы держать шарики у краёв и не закрывать текст
  const halfW = (z) => Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - z) * (canvas.clientWidth / Math.max(1, canvas.clientHeight));
  const halfH = (z) => Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - z);
  for (let i = 0; i < N; i++) {
    const p = palette[i % palette.length];
    const m = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: p.c, roughness: p.r, metalness: 0 }));
    const s = p.s[0] + Math.random() * (p.s[1] - p.s[0]);
    m.scale.setScalar(s);
    const z = -1 - Math.random() * 7;
    const hw = halfW(z), hh = halfH(z);
    const side = i % 2 ? 1 : -1;
    // по бокам: от 70% до 105% половины ширины; на широком экране шарики могут быть и ближе к центру сверху/снизу
    const narrow = canvas.clientWidth < 700;
    const x = side * hw * (narrow ? 0.62 + Math.random() * 0.3 : 0.7 + Math.random() * 0.35);
    const y = (Math.random() * 2 - 1) * hh * 0.9;
    m.position.set(x, y, z);
    m.userData = { y, sp: 0.3 + Math.random() * 0.6, ph: Math.random() * 6.28 };
    scene.add(m); bits.push(m);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  const mouse = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(canvas);
  const clock = new THREE.Clock();
  let running = false;
  function frame() {
    const t = clock.getElapsedTime();
    for (const m of bits) {
      m.position.y = m.userData.y + Math.sin(t * m.userData.sp + m.userData.ph) * 0.6;
      m.rotation.y = t * 0.2;
    }
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  function loop() {
    if (running) return; running = true;
    const tick = () => { if (!visible || document.hidden) { running = false; return; } frame(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  canvas.style.opacity = "0"; canvas.style.transition = "opacity 1.2s ease";
  requestAnimationFrame(() => { canvas.style.opacity = "1"; });
  if (reduced) { frame(); return; }
  loop();
}
