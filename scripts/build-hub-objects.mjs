/**
 * Gera os objetos físicos da sala do delegado (mesa, pasta, caderno, telefone fixo, etc.).
 * - Todos com transparência real (PNG RGBA @2x), sem retângulo de fundo.
 * - Mesma direção de luz (teto, sombra para baixo/direita), mesma paleta dessaturada
 *   e o mesmo grain do background.
 * - Objetos "deitados" usam leve achatamento vertical (câmera ~55° sobre a mesa).
 *
 * Saída: public/assets/scene/hub/*.png  (+ city-map.svg e wall-calendar.png)
 * Arte vetorial própria (sem fotos de terceiros); substituível por recortes fotográficos
 * mantendo os mesmos nomes de arquivo e tamanhos de design.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public/assets/scene/hub')

/** gerador pseudo-aleatório determinístico */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const SHADOW = `
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="sh2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
`

function wrap(w, h, body, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>${SHADOW}${defs}</defs>${body}</svg>`
}

/** grain dentro da área opaca (preserva alpha original) */
async function grain(png, strength = 26) {
  const meta = await sharp(png).metadata()
  const { width, height } = meta
  const buf = Buffer.alloc(width * height * 4)
  const r = rng(width * 31 + height)
  for (let i = 0; i < width * height; i++) {
    const v = 128 + Math.floor((r() - 0.5) * 80)
    buf[i * 4] = v
    buf[i * 4 + 1] = v
    buf[i * 4 + 2] = v
    buf[i * 4 + 3] = strength
  }
  const noise = await sharp(buf, { raw: { width, height, channels: 4 } }).png().toBuffer()
  const alpha = await sharp(png).ensureAlpha().extractChannel(3).toBuffer()
  const rgb = await sharp(png)
    .composite([{ input: noise, blend: 'overlay' }])
    .removeAlpha()
    .toBuffer()
  return sharp(rgb).joinChannel(alpha).png({ compressionLevel: 9 }).toBuffer()
}

async function emit(name, svg, { grainStrength = 26 } = {}) {
  const raw = await sharp(Buffer.from(svg), { density: 144 }).png().toBuffer()
  const final = await grain(raw, grainStrength)
  await writeFile(join(out, name), final)
  const m = await sharp(final).metadata()
  console.log('✓', name, `${m.width}x${m.height}`)
}

/* ------------------------------------------------------------------ */
/* Mesa de primeiro plano — 1920×480, começa em y=600 do cenário       */
/* ------------------------------------------------------------------ */
function tableSvg() {
  const r = rng(7)
  let scratches = ''
  for (let i = 0; i < 70; i++) {
    const y = 60 + r() * 400
    const x = 200 + r() * 1500
    const len = 40 + r() * 160
    scratches += `<line x1="${x}" y1="${y}" x2="${x + len}" y2="${y + (r() - 0.5) * 6}" stroke="#fff" stroke-opacity="${(0.025 + r() * 0.05).toFixed(3)}" stroke-width="${(0.6 + r() * 1.2).toFixed(2)}"/>`
  }
  const far = 32
  const body = `
  <!-- sombra projetada no piso/parede acima da borda traseira -->
  <polygon points="300,${far - 6} 1640,${far - 6} 2060,486 -140,486" fill="#000" opacity=".55" filter="url(#sh)"/>
  <!-- tampo -->
  <polygon points="300,${far} 1640,${far} 2040,480 -120,480" fill="url(#top)"/>
  <polygon points="300,${far} 1640,${far} 2040,480 -120,480" fill="url(#spot)"/>
  <!-- bisel da borda traseira -->
  <polygon points="300,${far} 1640,${far} 1646,${far + 6} 294,${far + 6}" fill="#98a39f" opacity=".75"/>
  <polygon points="300,${far + 6} 1640,${far + 6} 1646,${far + 9} 294,${far + 9}" fill="#000" opacity=".28"/>
  <!-- bordas laterais -->
  <line x1="300" y1="${far}" x2="-120" y2="480" stroke="#222927" stroke-width="3"/>
  <line x1="1640" y1="${far}" x2="2040" y2="480" stroke="#222927" stroke-width="3"/>
  <line x1="297" y1="${far + 2}" x2="-123" y2="482" stroke="#9aa6a2" stroke-opacity=".25" stroke-width="1"/>
  ${scratches}
  <!-- mata-borrão / base de couro -->
  <polygon points="588,150 1332,150 1590,480 330,480" fill="#000" opacity=".5" filter="url(#sh2)" transform="translate(5 8)"/>
  <polygon points="588,150 1332,150 1590,480 330,480" fill="url(#mat)"/>
  <polygon points="604,162 1316,162 1560,480 360,480" fill="none" stroke="#51483d" stroke-width="1.6" stroke-dasharray="7 5" opacity=".7"/>
  <polygon points="588,150 1332,150 1590,480 330,480" fill="url(#matlight)"/>
  `
  const defs = `
  <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6a7673"/>
    <stop offset=".35" stop-color="#56625f"/>
    <stop offset="1" stop-color="#3a4341"/>
  </linearGradient>
  <radialGradient id="spot" cx="50%" cy="8%" r="62%" gradientTransform="translate(0 0)">
    <stop offset="0" stop-color="#e8f1ee" stop-opacity=".30"/>
    <stop offset="1" stop-color="#e8f1ee" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="mat" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2d2925"/>
    <stop offset="1" stop-color="#201d1a"/>
  </linearGradient>
  <radialGradient id="matlight" cx="50%" cy="10%" r="70%">
    <stop offset="0" stop-color="#fff" stop-opacity=".07"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>`
  return wrap(1920, 480, body, defs)
}

/* ------------------------------------------------------------------ */
/* Pasta do caso (case-files) — 380×300                                */
/* ------------------------------------------------------------------ */
function folderSvg() {
  const lines = (x, y, w, n, step = 11) =>
    Array.from({ length: n }, (_, i) =>
      `<rect x="${x}" y="${y + i * step}" width="${w - ((i * 37) % 40)}" height="2.4" rx="1" fill="#5b574d" opacity=".55"/>`,
    ).join('')
  const body = `
  <g transform="translate(6 12)" filter="url(#sh)" opacity=".7">
    <g transform="translate(190 160) rotate(-5) scale(1 .88) translate(-190 -160)">
      <rect x="40" y="62" width="300" height="206" rx="6" fill="#000"/>
    </g>
  </g>
  <g transform="translate(190 160) rotate(-5) scale(1 .88) translate(-190 -160)">
    <!-- verso da pasta -->
    <path d="M40 74 h80 q8 0 12 -10 l6 -14 h66 q8 0 10 10 v14 h126 v196 h-300z" fill="url(#mb)"/>
    <!-- papéis -->
    <g transform="rotate(2.4 190 150)">
      <rect x="58" y="56" width="266" height="188" rx="2" fill="#d9d3c1"/>
      <rect x="58" y="56" width="266" height="188" rx="2" fill="url(#pp)"/>
      <rect x="74" y="72" width="110" height="6" fill="#5b574d" opacity=".7"/>
      ${lines(74, 92, 220, 8)}
    </g>
    <g transform="rotate(-2.2 190 150)">
      <rect x="64" y="64" width="262" height="186" rx="2" fill="#e0dac8"/>
      <rect x="64" y="64" width="262" height="186" rx="2" fill="url(#pp)"/>
      <rect x="80" y="80" width="90" height="5" fill="#4b6f78" opacity=".6"/>
      ${lines(80, 98, 226, 7)}
    </g>
    <!-- frente da pasta -->
    <path d="M36 102 h206 q8 0 12 -8 l8 -16 h28 q8 0 10 10 l4 14 h18 v186 h-300z" fill="url(#mf)"/>
    <path d="M36 102 h206 q8 0 12 -8 l8 -16 h28 q8 0 10 10 l4 14 h18" fill="none" stroke="#e5d3a3" stroke-opacity=".55" stroke-width="1.5"/>
    <!-- etiqueta -->
    <rect x="62" y="148" width="130" height="58" rx="2" fill="#dcd6c4"/>
    <rect x="62" y="148" width="130" height="58" rx="2" fill="none" stroke="#8b8571" stroke-width="1"/>
    <text x="72" y="170" font-family="Arial" font-weight="700" font-size="13" fill="#3b3a35" letter-spacing="1">SILVA, MARIANA</text>
    <text x="72" y="187" font-family="Courier New, monospace" font-size="11" fill="#55524a">BO 0001/2026</text>
    <rect x="72" y="193" width="60" height="3" fill="#8a3a30" opacity=".8"/>
    <!-- clipe -->
    <path d="M300 78 v32 q0 6 6 6 q6 0 6 -6 v-26" fill="none" stroke="#9aa0a4" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M308 90 v22" stroke="#6c7276" stroke-width="2.2" stroke-linecap="round"/>
  </g>`
  const defs = `
  <linearGradient id="mf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8a06b"/><stop offset="1" stop-color="#97814f"/></linearGradient>
  <linearGradient id="mb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c8756"/><stop offset="1" stop-color="#7f6c42"/></linearGradient>
  <linearGradient id="pp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>`
  return wrap(380, 300, body, defs)
}

/* ------------------------------------------------------------------ */
/* Caderno de investigação + caneta — 340×270                          */
/* ------------------------------------------------------------------ */
function notebookSvg() {
  const body = `
  <g transform="translate(7 13)" filter="url(#sh)" opacity=".72">
    <g transform="translate(150 140) rotate(6) scale(1 .88) translate(-150 -140)">
      <rect x="52" y="34" width="208" height="206" rx="8" fill="#000"/>
    </g>
  </g>
  <g transform="translate(150 140) rotate(6) scale(1 .88) translate(-150 -140)">
    <!-- bloco de páginas (espessura) -->
    <rect x="56" y="40" width="208" height="206" rx="6" fill="#cfc8b4"/>
    <rect x="52" y="34" width="208" height="206" rx="8" fill="url(#cv)"/>
    <!-- lombada -->
    <rect x="52" y="34" width="26" height="206" rx="8" fill="#10151d"/>
    <rect x="52" y="34" width="26" height="206" rx="8" fill="url(#sp)"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="68" y1="${52 + i * 22}" x2="74" y2="${52 + i * 22}" stroke="#3a4558" stroke-width="2"/>`).join('')}
    <!-- elástico -->
    <rect x="208" y="34" width="13" height="206" fill="#6b2b27"/>
    <rect x="208" y="34" width="4" height="206" fill="#fff" opacity=".1"/>
    <!-- etiqueta -->
    <rect x="98" y="72" width="92" height="62" rx="2" fill="#d8d1bd"/>
    <rect x="98" y="72" width="92" height="62" rx="2" fill="none" stroke="#8b8571" stroke-width="1"/>
    <text x="108" y="94" font-family="Arial" font-weight="700" font-size="12" fill="#3b3a35" letter-spacing="1.4">CADERNO</text>
    <rect x="108" y="102" width="70" height="2.4" fill="#5b574d" opacity=".6"/>
    <rect x="108" y="110" width="52" height="2.4" fill="#5b574d" opacity=".6"/>
    <rect x="108" y="118" width="64" height="2.4" fill="#5b574d" opacity=".6"/>
    <rect x="52" y="34" width="208" height="206" rx="8" fill="url(#gl)"/>
  </g>
  <!-- caneta -->
  <g transform="translate(5 9)" filter="url(#sh2)" opacity=".7">
    <path d="M232 222 L316 84" stroke="#000" stroke-width="11" stroke-linecap="round"/>
  </g>
  <g>
    <path d="M232 222 L316 84" stroke="#1a1c20" stroke-width="10" stroke-linecap="round"/>
    <path d="M232 222 L316 84" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round" transform="translate(-2 -1)"/>
    <path d="M296 118 L322 76" stroke="#aeb4b8" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M232 222 L226 232" stroke="#c9ccd0" stroke-width="5" stroke-linecap="round"/>
  </g>`
  const defs = `
  <linearGradient id="cv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a3446"/><stop offset="1" stop-color="#171d29"/></linearGradient>
  <linearGradient id="sp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
  <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`
  return wrap(340, 270, body, defs)
}

/* ------------------------------------------------------------------ */
/* Estação de áudio: notebook forense + fones + gravador — 440×330     */
/* ------------------------------------------------------------------ */
function audioSvg() {
  const r = rng(11)
  let bars = ''
  for (let i = 0; i < 46; i++) {
    const env = Math.sin((i / 46) * Math.PI)
    const h = 4 + env * 30 * (0.35 + r() * 0.65)
    bars += `<rect x="${102 + i * 4.6}" y="${132 - h / 2}" width="2.6" height="${h.toFixed(1)}" fill="#79c2bd" opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`
  }
  let keys = ''
  for (let row = 0; row < 4; row++)
    for (let c = 0; c < 14; c++)
      keys += `<rect x="${84 + c * 18.6 + row * 3}" y="${262 + row * 8.8}" width="15" height="6.4" rx="1.2" fill="#272b30"/>`
  const body = `
  <!-- luz emitida pela tela sobre a mesa -->
  <ellipse cx="220" cy="262" rx="190" ry="48" fill="#5db3ad" opacity=".26" filter="url(#glow)"/>
  <!-- sombra do notebook -->
  <g transform="translate(8 14)" filter="url(#sh)" opacity=".72">
    <polygon points="70,246 350,246 384,312 38,312" fill="#000"/>
  </g>
  <!-- base -->
  <polygon points="70,246 350,246 384,310 38,310" fill="url(#base)"/>
  <polygon points="70,246 350,246 352,250 68,250" fill="#cfd3d6" opacity=".35"/>
  ${keys}
  <polygon points="168,296 252,296 258,308 162,308" fill="#454a50" opacity=".9"/>
  <!-- tela -->
  <path d="M82 70 q0 -8 8 -8 h240 q8 0 8 8 l12 176 h-280z" fill="#0d0f11"/>
  <path d="M96 78 h228 l10 156 h-248z" fill="url(#scr)"/>
  <rect x="104" y="86" width="212" height="12" fill="#1b2a2c"/>
  <rect x="110" y="89" width="46" height="4" fill="#79c2bd" opacity=".8"/>
  <rect x="296" y="89" width="14" height="4" fill="#c8963e" opacity=".8"/>
  <rect x="104" y="106" width="212" height="52" fill="#0f191b"/>
  <line x1="104" y1="132" x2="316" y2="132" stroke="#79c2bd" stroke-opacity=".22" stroke-width=".8"/>
  ${bars}
  <rect x="104" y="166" width="62" height="56" fill="#111c1e"/>
  <rect x="172" y="166" width="144" height="56" fill="#111c1e"/>
  <rect x="112" y="176" width="46" height="3" fill="#79c2bd" opacity=".55"/>
  <rect x="112" y="184" width="36" height="3" fill="#79c2bd" opacity=".35"/>
  <rect x="112" y="192" width="40" height="3" fill="#79c2bd" opacity=".35"/>
  <rect x="180" y="176" width="108" height="3" fill="#79c2bd" opacity=".4"/>
  <rect x="180" y="184" width="80" height="3" fill="#79c2bd" opacity=".3"/>
  <rect x="180" y="192" width="96" height="3" fill="#79c2bd" opacity=".3"/>
  <rect x="180" y="200" width="60" height="3" fill="#c8963e" opacity=".45"/>
  <path d="M96 78 h228 l10 156 h-248z" fill="url(#gls)"/>
  <!-- fones -->
  <g transform="translate(9 12)" filter="url(#sh2)" opacity=".7">
    <path d="M356 286 q54 -76 4 -130" fill="none" stroke="#000" stroke-width="10"/>
    <ellipse cx="354" cy="292" rx="20" ry="26" fill="#000"/>
  </g>
  <path d="M358 282 q50 -74 2 -128" fill="none" stroke="#202327" stroke-width="9" stroke-linecap="round"/>
  <path d="M358 282 q50 -74 2 -128" fill="none" stroke="#6a7075" stroke-width="2" stroke-linecap="round" transform="translate(-2 -1)"/>
  <ellipse cx="352" cy="292" rx="20" ry="27" fill="url(#cup)"/>
  <ellipse cx="349" cy="290" rx="12" ry="18" fill="#15171a"/>
  <ellipse cx="355" cy="150" rx="16" ry="22" fill="url(#cup)"/>
  <!-- gravador -->
  <g transform="translate(6 10)" filter="url(#sh2)" opacity=".7"><rect x="14" y="238" width="42" height="68" rx="6" transform="rotate(-9 35 272)" fill="#000"/></g>
  <g transform="rotate(-9 35 272)">
    <rect x="14" y="238" width="42" height="68" rx="6" fill="url(#rec)"/>
    <rect x="21" y="246" width="28" height="16" rx="2" fill="#12191a"/>
    <rect x="24" y="250" width="14" height="2.4" fill="#79c2bd" opacity=".8"/>
    <circle cx="35" cy="278" r="7" fill="#7a2f29"/>
    <circle cx="35" cy="278" r="3" fill="#b24a3f"/>
    <rect x="22" y="292" width="26" height="3" rx="1.5" fill="#050607" opacity=".7"/>
  </g>`
  const defs = `
  <linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7077"/><stop offset="1" stop-color="#3f4348"/></linearGradient>
  <linearGradient id="scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#112023"/><stop offset="1" stop-color="#0a1315"/></linearGradient>
  <linearGradient id="gls" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="cup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b4046"/><stop offset="1" stop-color="#1b1d20"/></linearGradient>
  <linearGradient id="rec" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2d31"/><stop offset="1" stop-color="#16181b"/></linearGradient>`
  return wrap(440, 330, body, defs)
}

/* ------------------------------------------------------------------ */
/* Telefone fixo institucional — 330×250                               */
/* ------------------------------------------------------------------ */
function landlineSvg() {
  let coil = 'M52 122'
  for (let i = 0; i < 14; i++) coil += ` q${i % 2 ? -6 : 6} 10 0 16 q${i % 2 ? 6 : -6} 4 0 8`
  let keys = ''
  for (let row = 0; row < 4; row++)
    for (let c = 0; c < 3; c++)
      keys += `<ellipse cx="${190 + c * 28}" cy="${156 + row * 17}" rx="10" ry="6.6" fill="#2d3033"/><ellipse cx="${190 + c * 28}" cy="${154.5 + row * 17}" rx="10" ry="6.2" fill="#4a4e53"/>`
  const body = `
  <g transform="translate(8 14)" filter="url(#sh)" opacity=".72">
    <g transform="rotate(8 165 130)">
      <path d="M36 120 h250 q14 0 16 14 l8 82 h-304 l8 -82 q2 -14 14 -14z" fill="#000"/>
    </g>
  </g>
  <g transform="rotate(8 165 130)">
    <!-- base -->
    <path d="M36 120 h250 q14 0 16 14 l8 82 h-304 l8 -82 q2 -14 14 -14z" fill="url(#pb)"/>
    <path d="M36 120 h250 q14 0 16 14 l2 18 h-286 l2 -18 q2 -14 14 -14z" fill="#fff" opacity=".14"/>
    <path d="M26 216 h284 l-1 8 h-282z" fill="#6f6a5c"/>
    <!-- visor e ramal -->
    <rect x="52" y="146" width="84" height="26" rx="3" fill="#1d2420"/>
    <rect x="56" y="150" width="76" height="18" rx="2" fill="#7f9a86" opacity=".85"/>
    <text x="62" y="163" font-family="Courier New, monospace" font-size="11" fill="#1c2a20">RAMAL 204</text>
    <rect x="52" y="186" width="84" height="18" rx="2" fill="#d8d1bd"/>
    <text x="58" y="198" font-family="Arial" font-weight="700" font-size="8.5" fill="#3b3a35" letter-spacing="1">PLANTÃO · CARTÓRIO</text>
    <!-- teclado -->
    <rect x="172" y="140" width="94" height="78" rx="6" fill="#2a2c2f" opacity=".5"/>
    ${keys}
    <circle cx="276" cy="140" r="4" fill="#8a3a30"/>
    <!-- fone no gancho -->
    <g transform="translate(5 8)" filter="url(#sh2)" opacity=".6"><path d="M44 112 q118 -26 232 0" stroke="#000" stroke-width="34" fill="none" stroke-linecap="round"/></g>
    <path d="M44 112 q118 -26 232 0" stroke="url(#hs)" stroke-width="32" fill="none" stroke-linecap="round"/>
    <path d="M44 106 q118 -26 232 0" stroke="#fff" stroke-opacity=".22" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="112" rx="22" ry="26" fill="url(#hs2)"/>
    <ellipse cx="270" cy="112" rx="22" ry="26" fill="url(#hs2)"/>
    <ellipse cx="46" cy="110" rx="12" ry="15" fill="#121413" opacity=".7"/>
    <ellipse cx="274" cy="110" rx="12" ry="15" fill="#121413" opacity=".7"/>
    <!-- cabo espiral -->
    <path d="${coil}" fill="none" stroke="#25272a" stroke-width="4" stroke-linecap="round"/>
  </g>`
  const defs = `
  <linearGradient id="pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8b19e"/><stop offset="1" stop-color="#8d8878"/></linearGradient>
  <linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9a290"/><stop offset="1" stop-color="#7a7566"/></linearGradient>
  <radialGradient id="hs2" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#b7b09d"/><stop offset="1" stop-color="#6d6859"/></radialGradient>`
  return wrap(330, 250, body, defs)
}

/* ------------------------------------------------------------------ */
/* Monitor + teclado — 520×470 (monitor em pé, teclado deitado)        */
/* ------------------------------------------------------------------ */
function monitorSvg() {
  let keys = ''
  for (let row = 0; row < 4; row++)
    for (let c = 0; c < 17; c++)
      keys += `<rect x="${102 + c * 17 + row * 4}" y="${402 + row * 10}" width="14" height="7.2" rx="1.4" fill="#2b2e32"/>`
  const rows = Array.from({ length: 9 }, (_, i) => {
    const w = 120 + ((i * 53) % 160)
    return `<rect x="84" y="${122 + i * 15}" width="${w}" height="3" fill="#79c2bd" opacity="${i % 3 === 0 ? 0.55 : 0.3}"/>`
  }).join('')
  const body = `
  <ellipse cx="260" cy="130" rx="250" ry="130" fill="#5db3ad" opacity=".16" filter="url(#glow)"/>
  <ellipse cx="260" cy="420" rx="250" ry="38" fill="#5db3ad" opacity=".18" filter="url(#glow)"/>
  <!-- sombras -->
  <g transform="translate(9 14)" filter="url(#sh)" opacity=".7">
    <ellipse cx="258" cy="388" rx="124" ry="22" fill="#000"/>
    <polygon points="90,398 430,398 462,458 58,458" fill="#000"/>
  </g>
  <!-- base e pescoço -->
  <ellipse cx="258" cy="384" rx="118" ry="20" fill="#44484d"/>
  <ellipse cx="258" cy="380" rx="118" ry="19" fill="url(#bs)"/>
  <polygon points="214,326 302,326 322,378 194,378" fill="url(#nk)"/>
  <!-- corpo -->
  <rect x="34" y="14" width="448" height="318" rx="10" fill="url(#mb)"/>
  <rect x="34" y="14" width="448" height="318" rx="10" fill="none" stroke="#d4d7d9" stroke-opacity=".25" stroke-width="1.4"/>
  <rect x="58" y="36" width="400" height="268" rx="4" fill="#0b0d0f"/>
  <rect x="66" y="44" width="384" height="252" rx="2" fill="url(#sc)"/>
  <!-- conteúdo de tela -->
  <rect x="66" y="44" width="384" height="22" fill="#14282a"/>
  <rect x="76" y="52" width="130" height="6" fill="#79c2bd" opacity=".85"/>
  <rect x="396" y="52" width="40" height="6" fill="#c8963e" opacity=".7"/>
  <rect x="66" y="66" width="68" height="230" fill="#0e1b1d"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="76" y="${82 + i * 24}" width="${38 + (i % 3) * 8}" height="4" fill="#79c2bd" opacity="${i === 4 ? 0.75 : 0.35}"/>`).join('')}
  <g transform="translate(76 0)">${rows}</g>
  <rect x="150" y="268" width="170" height="14" rx="2" fill="#16282b" stroke="#79c2bd" stroke-opacity=".5" stroke-width=".8"/>
  <rect x="156" y="273" width="60" height="3.4" fill="#79c2bd" opacity=".8"/>
  <rect x="66" y="44" width="384" height="252" fill="url(#gl)"/>
  <circle cx="458" cy="318" r="3.2" fill="#c8963e" opacity=".9"/>
  <!-- teclado -->
  <polygon points="90,398 430,398 462,456 58,456" fill="url(#kb)"/>
  <polygon points="90,398 430,398 432,402 88,402" fill="#fff" opacity=".18"/>
  ${keys}
  <polygon points="214,432 304,432 310,446 208,446" fill="#44484d" opacity=".8"/>`
  const defs = `
  <linearGradient id="mb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a9da0"/><stop offset="1" stop-color="#6e7276"/></linearGradient>
  <linearGradient id="bs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8186"/><stop offset="1" stop-color="#4f5358"/></linearGradient>
  <linearGradient id="nk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a5e63"/><stop offset=".5" stop-color="#8b8f94"/><stop offset="1" stop-color="#555a5f"/></linearGradient>
  <linearGradient id="sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2022"/><stop offset="1" stop-color="#091214"/></linearGradient>
  <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="kb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c8085"/><stop offset="1" stop-color="#4a4e53"/></linearGradient>`
  return wrap(520, 470, body, defs)
}

/* ------------------------------------------------------------------ */
/* Xícara de café — 150×150                                            */
/* ------------------------------------------------------------------ */
function coffeeSvg() {
  const body = `
  <g transform="translate(7 13)" filter="url(#sh)" opacity=".75"><ellipse cx="74" cy="100" rx="58" ry="32" fill="#000"/></g>
  <ellipse cx="74" cy="98" rx="58" ry="32" fill="url(#sa)"/>
  <ellipse cx="74" cy="94" rx="40" ry="21" fill="#bfbbb0" opacity=".6"/>
  <path d="M36 74 q0 40 38 42 q38 -2 38 -42z" fill="url(#cs)"/>
  <path d="M110 80 q26 0 22 18 q-4 14 -26 12" fill="none" stroke="#d8d5ca" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="74" cy="74" rx="38" ry="19" fill="#eceae2"/>
  <ellipse cx="74" cy="74" rx="38" ry="19" fill="none" stroke="#a9a699" stroke-width="1.2"/>
  <ellipse cx="74" cy="75" rx="31" ry="14.5" fill="url(#co)"/>
  <ellipse cx="66" cy="72" rx="12" ry="3.4" fill="#fff" opacity=".18"/>
  <rect x="20" y="104" width="46" height="5" rx="2.5" fill="#bdbab0" transform="rotate(-14 43 106)"/>`
  const defs = `
  <radialGradient id="sa" cx="45%" cy="35%" r="75%"><stop offset="0" stop-color="#d7d4c9"/><stop offset="1" stop-color="#9b988c"/></radialGradient>
  <linearGradient id="cs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9c6bb"/><stop offset=".45" stop-color="#e6e4dc"/><stop offset="1" stop-color="#a7a498"/></linearGradient>
  <radialGradient id="co" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#3a281b"/><stop offset="1" stop-color="#1e140c"/></radialGradient>`
  return wrap(150, 150, body, defs)
}

/* ------------------------------------------------------------------ */
/* Fichas físicas que aparecem na mesa conforme o caso avança          */
/* ------------------------------------------------------------------ */
function deskSheetSvg(label, accent) {
  const body = `
  <g transform="translate(6 11)" filter="url(#sh)" opacity=".7"><rect x="20" y="16" width="150" height="190" rx="2" fill="#000" transform="rotate(7 95 111)"/></g>
  <g transform="rotate(7 95 111)">
    <rect x="20" y="16" width="150" height="190" rx="2" fill="#dcd6c4"/>
    <rect x="20" y="16" width="150" height="190" rx="2" fill="url(#pp)"/>
    <rect x="34" y="30" width="86" height="7" fill="${accent}" opacity=".75"/>
    <text x="34" y="52" font-family="Arial" font-weight="700" font-size="10" fill="#3b3a35" letter-spacing="1">${label}</text>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="34" y="${64 + i * 11}" width="${112 - ((i * 29) % 46)}" height="2.4" rx="1" fill="#5b574d" opacity=".5"/>`).join('')}
    <path d="M22 18 l16 0 l-16 16z" fill="#b9b19b"/>
  </g>`
  const defs = `<linearGradient id="pp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>`
  return wrap(200, 230, body, defs)
}

/* ------------------------------------------------------------------ */
/* Calendário de parede — 240×320                                      */
/* ------------------------------------------------------------------ */
function calendarSvg() {
  const names = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  // outubro/2026 começa numa quinta-feira (índice 4 com semana iniciando no domingo)
  const startDow = 4
  const days = 31
  let cells = ''
  for (let d = 1; d <= days; d++) {
    const idx = startDow + d - 1
    const col = idx % 7
    const row = Math.floor(idx / 7)
    const x = 30 + col * 26
    const y = 128 + row * 28
    cells += `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial" font-size="13" fill="${col === 0 ? '#8a3a30' : '#3b3a35'}">${d}</text>`
  }
  const circleIdx = startDow + 13 - 1
  const cx = 30 + (circleIdx % 7) * 26
  const cy = 128 + Math.floor(circleIdx / 7) * 28
  const body = `
  <g transform="translate(7 12)" filter="url(#sh)" opacity=".62"><rect x="20" y="28" width="200" height="270" rx="2" fill="#000"/></g>
  <rect x="20" y="28" width="200" height="270" rx="2" fill="#d8d2c0"/>
  <rect x="20" y="28" width="200" height="270" rx="2" fill="url(#pp)"/>
  <rect x="20" y="28" width="200" height="62" fill="#7b3a32"/>
  <rect x="20" y="28" width="200" height="62" fill="url(#hd)"/>
  <text x="120" y="68" text-anchor="middle" font-family="Arial" font-weight="700" font-size="20" fill="#e8dfd0" letter-spacing="3">OUTUBRO</text>
  <text x="120" y="84" text-anchor="middle" font-family="Arial" font-size="11" fill="#e8dfd0" opacity=".85" letter-spacing="2">2026</text>
  ${names.map((n, i) => `<text x="${30 + i * 26}" y="108" text-anchor="middle" font-family="Arial" font-weight="700" font-size="10" fill="#6b675b">${n}</text>`).join('')}
  ${cells}
  <ellipse cx="${cx}" cy="${cy - 4}" rx="13" ry="11" fill="none" stroke="#a63a2e" stroke-width="2.2" transform="rotate(-8 ${cx} ${cy - 4})"/>
  <circle cx="120" cy="16" r="4" fill="#2d3033"/>
  <path d="M120 20 L92 44 M120 20 L148 44" stroke="#2d3033" stroke-width="1.2" opacity=".7"/>`
  const defs = `
  <linearGradient id="pp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>
  <linearGradient id="hd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>`
  return wrap(240, 320, body, defs)
}

/* ------------------------------------------------------------------ */
/* Mapa impresso da cidade (arte vetorial reutilizada na tela de locais)*/
/* ------------------------------------------------------------------ */
function cityMapSvg() {
  const W = 1200
  const H = 800
  const r = rng(2026)
  let minor = ''
  for (let i = 0; i < 26; i++) {
    const x = 60 + i * 44 + (r() - 0.5) * 6
    minor += `<line x1="${x}" y1="0" x2="${x + (r() - 0.5) * 60}" y2="${H}" stroke="#e9e3d2" stroke-width="2" opacity=".75"/>`
  }
  for (let i = 0; i < 18; i++) {
    const y = 40 + i * 46 + (r() - 0.5) * 6
    minor += `<line x1="0" y1="${y}" x2="${W}" y2="${y + (r() - 0.5) * 50}" stroke="#e9e3d2" stroke-width="2" opacity=".75"/>`
  }
  const body = `
  <rect width="${W}" height="${H}" fill="#d6cfb9"/>
  <!-- água -->
  <path d="M0 560 C140 520 260 600 380 640 C520 690 640 650 760 720 C860 780 960 760 1200 790 L1200 800 L0 800z" fill="#8fa4a8"/>
  <path d="M0 560 C140 520 260 600 380 640 C520 690 640 650 760 720 C860 780 960 760 1200 790" fill="none" stroke="#6f868b" stroke-width="3"/>
  <!-- parques -->
  <path d="M120 120 q70 -40 150 -10 q30 60 -20 100 q-90 20 -130 -30z" fill="#a9b394"/>
  <path d="M880 140 q80 -30 170 10 q10 70 -60 90 q-100 0 -110 -100z" fill="#a9b394"/>
  <path d="M640 430 q50 -30 100 0 q20 40 -30 60 q-60 0 -70 -60z" fill="#a9b394" opacity=".9"/>
  <!-- malha de ruas -->
  ${minor}
  <!-- avenidas -->
  <path d="M0 330 C300 300 520 380 760 330 S1100 270 1200 300" fill="none" stroke="#f1ecde" stroke-width="12"/>
  <path d="M0 330 C300 300 520 380 760 330 S1100 270 1200 300" fill="none" stroke="#c6bfa8" stroke-width="1.5"/>
  <path d="M300 0 C340 200 420 380 400 520 S460 700 520 800" fill="none" stroke="#f1ecde" stroke-width="11"/>
  <path d="M780 0 C760 160 820 300 760 420 S840 640 860 800" fill="none" stroke="#f1ecde" stroke-width="11"/>
  <path d="M0 150 C200 190 440 120 700 190 S1000 120 1200 160" fill="none" stroke="#eee8d8" stroke-width="7"/>
  <path d="M60 760 C260 680 420 560 700 520 S1040 480 1200 420" fill="none" stroke="#eee8d8" stroke-width="7"/>
  <!-- rótulos -->
  <g font-family="Arial" font-size="15" fill="#6b675b" letter-spacing="3" opacity=".75">
    <text x="470" y="318" transform="rotate(-4 470 318)">AV. CENTRAL</text>
    <text x="120" y="690" fill="#566b70" opacity=".9">BAÍA</text>
    <text x="900" y="136" opacity=".6">PARQUE NORTE</text>
  </g>
  <!-- dobras do papel -->
  <line x1="${W / 3}" y1="0" x2="${W / 3}" y2="${H}" stroke="#000" stroke-opacity=".08" stroke-width="2"/>
  <line x1="${(2 * W) / 3}" y1="0" x2="${(2 * W) / 3}" y2="${H}" stroke="#000" stroke-opacity=".08" stroke-width="2"/>
  <line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="#000" stroke-opacity=".08" stroke-width="2"/>
  <rect width="${W}" height="${H}" fill="url(#vg)"/>`
  const defs = `<radialGradient id="vg" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a2418" stop-opacity=".28"/></radialGradient>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`
}

/** Mapa na parede: o mesmo mapa com sombra, tachinhas e papel levemente inclinado */
async function wallMap() {
  const mapSvg = cityMapSvg()
  const W = 520
  const H = 380
  const mapPng = await sharp(Buffer.from(mapSvg), { density: 72 })
    .resize(440, 293)
    .modulate({ saturation: 0.85, brightness: 0.92 })
    .png()
    .toBuffer()
  const frame = wrap(
    W,
    H,
    `
    <g transform="translate(9 14)" filter="url(#sh)" opacity=".6"><rect x="34" y="34" width="440" height="293" fill="#000" transform="rotate(-1.4 254 180)"/></g>
    <g transform="rotate(-1.4 254 180)">
      <image href="data:image/png;base64,${mapPng.toString('base64')}" x="34" y="34" width="440" height="293"/>
      <rect x="34" y="34" width="440" height="293" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/>
      <circle cx="52" cy="48" r="6" fill="#8a3a30"/><circle cx="50" cy="46" r="2" fill="#fff" opacity=".5"/>
      <circle cx="456" cy="48" r="6" fill="#8a3a30"/><circle cx="454" cy="46" r="2" fill="#fff" opacity=".5"/>
      <circle cx="52" cy="314" r="6" fill="#8a3a30"/><circle cx="50" cy="312" r="2" fill="#fff" opacity=".5"/>
      <circle cx="456" cy="314" r="6" fill="#8a3a30"/><circle cx="454" cy="312" r="2" fill="#fff" opacity=".5"/>
    </g>`,
  )
  const raw = await sharp(Buffer.from(frame), { density: 144 }).png().toBuffer()
  await writeFile(join(out, 'wall-map.png'), await grain(raw, 22))
  console.log('✓ wall-map.png')
}

async function main() {
  await mkdir(out, { recursive: true })
  await emit('desk-table.png', tableSvg(), { grainStrength: 30 })
  await emit('case-folder.png', folderSvg())
  await emit('notebook.png', notebookSvg())
  await emit('audio-station.png', audioSvg())
  await emit('landline.png', landlineSvg())
  await emit('monitor.png', monitorSvg())
  await emit('coffee.png', coffeeSvg())
  await emit('desk-sheet-bo.png', deskSheetSvg('BOLETIM DE OCORRÊNCIA', '#4b6f78'))
  await emit('wall-calendar.png', calendarSvg(), { grainStrength: 20 })
  await wallMap()
  await writeFile(join(out, 'city-map.svg'), cityMapSvg())
  console.log('✓ city-map.svg')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
