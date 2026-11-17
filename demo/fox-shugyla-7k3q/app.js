// ---------- Меню ----------
const MENU = [
  { cat: "tea", img: "showcase-fruittea-double-passion", name: "Double Passion", text: "Фруктовый чай с маракуйей и тапиокой — те самые жевательные шарики." },
  { cat: "tea", img: "showcase-fruittea-six-grapes", name: "Six Grapes", text: "Виноградный фруктовый чай с желейными шариками." },
  { cat: "tea", img: "showcase-fruittea-strawberry-orange", name: "Strawberry Orange", text: "Клубника и апельсин — яркий освежающий чай." },
  { cat: "tea", img: "showcase-cooler-orange-mix", name: "Orange Mix Cooler", text: "Холодный апельсиновый кулер со льдом." },
  { cat: "lemonade", img: "showcase-lemonade-kiwi-apple", name: "Kiwi Apple", text: "Лимонад с киви и яблоком." },
  { cat: "lemonade", img: "showcase-lemonade-strawberry-mojito", name: "Strawberry Mojito", text: "Клубничный мохито с лаймом, без алкоголя." },
  { cat: "smoothie", img: "showcase-smoothie-apple", name: "Apple Smoothie", text: "Нежный яблочный смузи." },
  { cat: "ice", img: "showcase-icecream-vanilla", name: "Ванильный рожок", text: "Классическое мягкое мороженое в розовом рожке." },
  { cat: "ice", img: "showcase-sundae-mango-mix", name: "Sundae Mango Mix", text: "Сандэ с манго, фруктами и тапиокой." },
  { cat: "ice", img: "showcase-sundae-oreo", name: "Sundae Oreo", text: "Мороженое с шоколадным топпингом и печеньем Oreo." },
  { cat: "ice", img: "showcase-sundae-peach", name: "Sundae Peach", text: "Мороженое с персиковым топпингом." },
];
const CAT = { tea: "Фруктовый чай", lemonade: "Лимонад", smoothie: "Смузи", ice: "Мороженое" };

// ---------- Звук (генерируется, без файлов) ----------
let audio = null;
let soundOn = true;
function ctx() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === "suspended") audio.resume();
  return audio;
}
// «пузырёк боба» — мягкое «блоп» снизу вверх на каждом щелчке барабана
let bubbleStep = 0;
function tick() {
  if (!soundOn) return;
  const a = ctx(), t = a.currentTime;
  const k = (bubbleStep++ % 6);
  const o = a.createOscillator(), g = a.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(220 + k * 8, t);
  o.frequency.exponentialRampToValueAtTime(620 + k * 15, t + 0.09);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + 0.11);
  if (navigator.vibrate) navigator.vibrate(4);
}
// «поп» для штампа
function pop(high = false) {
  if (!soundOn) return;
  const a = ctx(), t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(high ? 520 : 380, t);
  o.frequency.exponentialRampToValueAtTime(high ? 1400 : 900, t + 0.09);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + 0.2);
  if (navigator.vibrate) navigator.vibrate(12);
}
// маленькая мелодия победы
function win() {
  if (!soundOn) return;
  [523, 659, 784, 1046].forEach((f, i) => {
    const a = ctx(), t = a.currentTime + i * 0.09;
    const o = a.createOscillator(), g = a.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.3);
  });
}
const soundBtn = document.getElementById("sound");
soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundBtn.setAttribute("aria-pressed", String(soundOn));
  soundBtn.setAttribute("aria-label", soundOn ? "Звук включён" : "Звук выключен");
  if (soundOn) pop(true);
});
// браузеры разрешают звук только после первого касания
addEventListener("pointerdown", () => { if (soundOn) ctx(); }, { once: true, passive: true });

// ---------- Меню-барабан ----------
const track = document.getElementById("track");
track.innerHTML = MENU.map((m, i) => `
  <div class="item" data-i="${i}" data-cat="${m.cat}">
    <div class="item__disc"><img src="img/${m.img}.webp" alt="${m.name}" width="600" height="600" loading="${i < 3 ? "eager" : "lazy"}" draggable="false" /></div>
  </div>`).join("");
const items = [...track.querySelectorAll(".item")];
const info = document.querySelector(".info");
const infoCat = document.getElementById("infoCat"), infoName = document.getElementById("infoName"), infoText = document.getElementById("infoText");
let current = -1;

function visible() { return items.filter((el) => !el.hidden); }

function render() {
  const mid = track.scrollLeft + track.clientWidth / 2;
  let best = null, bestD = Infinity;
  for (const el of visible()) {
    const c = el.offsetLeft + el.offsetWidth / 2;
    const off = (c - mid) / el.offsetWidth;
    const a = Math.min(Math.abs(off), 3);
    el.style.transform = `rotateY(${off * -38}deg) translateZ(${-a * 90}px) scale(${1 - a * 0.1})`;
    el.style.opacity = String(1 - a * 0.28);
    el.style.zIndex = String(10 - Math.round(a * 3));
    if (Math.abs(off) < bestD) { bestD = Math.abs(off); best = el; }
  }
  if (best) {
    const i = Number(best.dataset.i);
    if (i !== current) {
      if (current !== -1) tick();
      current = i;
      const m = MENU[i];
      infoCat.textContent = CAT[m.cat];
      infoName.textContent = m.name;
      infoText.textContent = m.text;
      info.classList.remove("is-changing"); void info.offsetWidth; info.classList.add("is-changing");
    }
  }
}
let raf = 0;
track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); }, { passive: true });
addEventListener("resize", render);

function go(dir) {
  const v = visible(); const idx = v.findIndex((el) => Number(el.dataset.i) === current);
  const next = v[Math.max(0, Math.min(v.length - 1, idx + dir))];
  if (next) track.scrollTo({ left: next.offsetLeft + next.offsetWidth / 2 - track.clientWidth / 2, behavior: "smooth" });
}
document.querySelector(".wheel__arrow--prev").addEventListener("click", () => go(-1));
document.querySelector(".wheel__arrow--next").addEventListener("click", () => go(1));
track.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); });
// колёсико мыши листает барабан
track.addEventListener("wheel", (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); track.scrollBy({ left: e.deltaY, behavior: "auto" }); }
}, { passive: false });
// перетаскивание мышкой на компьютере
let drag = null;
track.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") { drag = { x: e.clientX, s: track.scrollLeft }; track.style.scrollSnapType = "none"; } });
addEventListener("pointermove", (e) => { if (drag) track.scrollLeft = drag.s - (e.clientX - drag.x); });
addEventListener("pointerup", () => { if (drag) { drag = null; track.style.scrollSnapType = ""; go(0); } });

// категории
document.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => {
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-on", c === chip));
  const cat = chip.dataset.cat;
  items.forEach((el) => { el.hidden = cat !== "all" && el.dataset.cat !== cat; });
  current = -1;
  track.scrollLeft = 0;
  render();
  pop();
}));
requestAnimationFrame(render);

// ---------- Карта постоянного клиента ----------
const stamps = [...document.querySelectorAll(".stamp")];
const card = document.getElementById("card");
const note = document.getElementById("loyalNote");
stamps.forEach((s, i) => s.addEventListener("click", () => {
  const filled = stamps.filter((x) => x.classList.contains("is-on")).length;
  if (i !== filled) { s.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 250 }); return; }
  s.classList.add("is-on");
  if (i === stamps.length - 1) {
    win(); confetti(s); card.classList.remove("is-win"); void card.offsetWidth; card.classList.add("is-win");
    note.textContent = "Ура! Шестой — в подарок 🎉 Нажмите на карту, чтобы начать заново.";
  } else {
    pop(i === stamps.length - 2);
    note.textContent = `Отметок: ${i + 1} из 6. Ещё ${5 - i} до подарка!`;
  }
}));
card.addEventListener("click", (e) => {
  if (e.target.closest(".stamp")) return;
  if (stamps.every((s) => s.classList.contains("is-on"))) {
    stamps.forEach((s) => s.classList.remove("is-on"));
    note.textContent = "Покупаете напиток — получаете отметку. Шестой — бесплатно.";
    pop();
  }
});
function confetti(from) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = from.getBoundingClientRect();
  const colors = ["#e8417a", "#f47b20", "#2ba8e0", "#ffc2d4", "#ffd166", "#7bd389"];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement("i");
    p.className = "confetti";
    p.style.background = colors[i % colors.length];
    document.body.appendChild(p);
    const ang = Math.random() * Math.PI * 2, sp = 140 + Math.random() * 260;
    const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    p.animate([
      { transform: `translate(${x0}px, ${y0}px) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${x0 + Math.cos(ang) * sp}px, ${y0 + Math.sin(ang) * sp + 260}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
    ], { duration: 1200 + Math.random() * 600, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => p.remove();
  }
}

// ---------- Точка на карте ----------
const pin = document.getElementById("pin"), bubble = document.getElementById("bubble");
pin.addEventListener("click", () => {
  pin.classList.remove("is-jump"); void pin.offsetWidth; pin.classList.add("is-jump");
  pop(true);
  bubble.hidden = !bubble.hidden;
});
document.getElementById("map").addEventListener("click", (e) => {
  if (!e.target.closest(".pin") && !e.target.closest(".bubble")) {
    pin.classList.remove("is-jump"); void pin.offsetWidth; pin.classList.add("is-jump"); pop();
  }
});

// ---------- 3D-сцена (запускаем после появления текста) ----------
setTimeout(() => import("./scene.js").then((m) => m.start(document.getElementById("scene"))).catch(() => {}), 600);
