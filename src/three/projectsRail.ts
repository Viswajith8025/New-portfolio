import * as THREE from 'three'
import type { Project } from '../data/site'

const FOV = 42
const CAM_Z = 9
const CARD_W = 3.4
const SPACING = 0.13
const RAIL_SPAN = 1.7
const FLY_SPAN = 0.55
const FADE = 0.12
const ASPECT = 16 / 9
const VISIBLE_ROWS = 3
const INTRO_VH = 155
const PAN_VH = 100
const HOLD_VH = 130

const RAIL = [
  [0, 3, -60],
  [-10, 2, -34],
  [-12, 0.5, -14],
  [-7, -0.4, -1],
  [0, -0.8, 3.2],
  [7, -0.4, -1],
  [12, 0.6, -12],
  [9, 1.6, -26],
  [2, 2.2, -34],
]
const RAIL_MOBILE = [
  [0, 3, -50],
  [-4, 1.5, -26],
  [-3.5, 0, -8],
  [0, -0.6, 2.5],
  [3.5, 0, -8],
  [4, 1.5, -24],
  [1, 2.4, -32],
]

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const FRAG = `
  uniform sampler2D map;
  uniform vec2 uvScale;
  uniform vec2 uvOffset;
  uniform float uOpacity;
  uniform float uHover;
  uniform float uReady;
  varying vec2 vUv;
  float rbox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    vec2 uv = vUv;
    if (!gl_FrontFacing) uv.x = 1.0 - uv.x;
    vec2 p = (uv - 0.5) * vec2(1.7778, 1.0);
    float d = rbox(p, vec2(0.8889, 0.5), 0.07);
    float mask = 1.0 - smoothstep(-0.003, 0.003, d);
    if (mask < 0.01) discard;
    vec3 tex = texture2D(map, uv * uvScale + uvOffset).rgb;
    vec3 col = mix(vec3(0.05, 0.035, 0.045), tex, uReady);
    col *= 0.82 + 0.28 * uHover;
    col += vec3(1.0) * 0.07 * smoothstep(0.55, 1.0, uv.y) * (1.0 - uv.x * 0.6);
    col += vec3(1.0, 0.12, 0.2) * 0.18 * uHover * smoothstep(0.45, 0.0, uv.y);
    float rim = smoothstep(-0.022, -0.004, d);
    vec3 rimCol = mix(vec3(0.75, 0.75, 0.8), vec3(1.0, 0.3, 0.38), uHover);
    col = mix(col, rimCol, rim * (0.35 + 0.35 * uHover));
    gl_FragColor = vec4(col, mask * uOpacity);
  }
`

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2
}

function linger(value: number) {
  const t = clamp01(value)
  const centered = (t - 0.5) * 2
  const shaped = Math.sign(centered) * Math.abs(centered) ** 1.7
  return clamp01(0.5 + shaped / 2)
}

function introUnits(count: number) {
  return RAIL_SPAN + FLY_SPAN + Math.max(count - 1, 0) * SPACING
}

function cardProgress(introT: number, index: number, units: number) {
  const raw = clamp01(introT) * units - index * SPACING
  return {
    rail: clamp01(raw / RAIL_SPAN),
    fly: clamp01((raw - RAIL_SPAN) / FLY_SPAN),
    opacity: raw <= 0 ? 0 : Math.min(1, raw / FADE),
  }
}

function gridLayout(count: number, width: number, height: number) {
  const viewHeight = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180)
  const aspect = width / Math.max(height, 1)
  const viewWidth = viewHeight * aspect
  const cols = aspect < 0.8 ? 2 : 3
  const rows = Math.ceil(count / Math.max(cols, 1))
  const visibleRows = Math.max(1, Math.min(rows, VISIBLE_ROWS))
  const reserved = viewHeight * (aspect < 0.8 ? 0.34 : 0.4)
  const area = viewHeight - reserved - viewHeight * 0.04
  const gap = Math.min(viewWidth, viewHeight) * 0.025
  let cellW = Math.min((viewWidth * 0.92 - gap * (cols - 1)) / cols, ((area - gap * (visibleRows - 1)) / visibleRows) * ASPECT)
  cellW = Math.max(cellW, 0.5)
  const cellH = cellW / ASPECT
  const gridW = cols * cellW + (cols - 1) * gap
  const gridH = visibleRows * cellH + (visibleRows - 1) * gap
  const top = viewHeight / 2 - reserved - (area - gridH) / 2
  const stride = cellH + gap
  const cells = Array.from({ length: count }, (_, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    return {
      x: -gridW / 2 + cellW / 2 + col * (cellW + gap),
      y: top - cellH / 2 - row * stride,
      side: cols > 1 && col === 0 ? -1 : cols > 1 && col === cols - 1 ? 1 : 0,
      vert: row === 0 ? 1 : row === rows - 1 ? -1 : 0,
    }
  })
  const extraRows = Math.max(0, rows - visibleRows)
  const overflow = extraRows * stride + (extraRows > 0 ? stride * 0.58 : 0)
  return { cells, cellW, cellH, extraRows, overflow }
}

function fitCover(material: THREE.ShaderMaterial, width: number, height: number) {
  const image = width / Math.max(height, 1)
  const scale = material.uniforms.uvScale.value as THREE.Vector2
  const offset = material.uniforms.uvOffset.value as THREE.Vector2
  if (image > ASPECT) {
    const next = ASPECT / image
    scale.set(next, 1)
    offset.set((1 - next) / 2, 0)
  } else {
    const next = image / ASPECT
    scale.set(1, next)
    offset.set(0, (1 - next) / 2)
  }
}

export function mountProjectsRail(
  section: HTMLElement,
  stage: HTMLElement,
  tooltip: HTMLElement,
  projects: Project[],
  onSelect: (index: number) => void,
) {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  const coarse = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  stage.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200)
  camera.position.set(0, 0, CAM_Z)
  const points = (coarse ? RAIL_MOBILE : RAIL).map(([x, y, z]) => new THREE.Vector3(x, y, z))
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
  const samples: THREE.Vector3[] = []
  const tangents: THREE.Vector3[] = []
  for (let i = 0; i <= 400; i++) {
    samples.push(curve.getPointAt(i / 400))
    tangents.push(curve.getTangentAt(i / 400))
  }
  const sample = (t: number, position: THREE.Vector3, tangent: THREE.Vector3) => {
    const scaled = clamp01(t) * 400
    const index = Math.min(Math.floor(scaled), 399)
    const mix = scaled - index
    position.lerpVectors(samples[index], samples[index + 1], mix)
    tangent.lerpVectors(tangents[index], tangents[index + 1], mix).normalize()
  }

  const geometry = new THREE.PlaneGeometry(ASPECT, 1, 24, 14)
  const placeholder = new THREE.DataTexture(new Uint8Array([13, 9, 11, 255]), 1, 1)
  placeholder.needsUpdate = true
  const loader = new THREE.TextureLoader()

  const cards = projects.map((project, index) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        map: { value: placeholder },
        uvScale: { value: new THREE.Vector2(1, 1) },
        uvOffset: { value: new THREE.Vector2() },
        uOpacity: { value: 0 },
        uHover: { value: 0 },
        uReady: { value: 0 },
      },
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData.index = index
    scene.add(mesh)
    const card = { project, mesh, material, hover: 0, texture: null as THREE.Texture | null, loaded: false }
    return card
  })

  const loadTextures = () => {
    cards.forEach((card) => {
      if (card.loaded) return
      card.loaded = true
      loader.load(card.project.poster, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.generateMipmaps = false
        card.texture = texture
        card.material.uniforms.map.value = texture
        const image = texture.image as { width: number; height: number }
        fitCover(card.material, image.width, image.height)
        card.material.uniforms.uReady.value = 1
      })
    })
  }
  const textureObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      loadTextures()
      textureObserver.disconnect()
    },
    { rootMargin: '100% 0px' },
  )
  textureObserver.observe(section)

  let width = 1
  let height = 1
  let cardFit = 1
  let layout = gridLayout(cards.length, 1, 1)
  let scrollMap = { intro: 1, panStart: 1, pan: 0 }
  let target = 0
  let progress = 0
  let active = true
  let kick = () => {}
  const readScroll = () => {
    const bounds = section.getBoundingClientRect()
    const distance = bounds.height - window.innerHeight
    target = distance > 0 ? Math.max(0, Math.min(1, -bounds.top / distance)) : 0
    const near = bounds.bottom > -250 && bounds.top < window.innerHeight + 250
    if (near !== active) {
      active = near
      kick()
    }
  }
  const resize = () => {
    width = stage.clientWidth
    height = stage.clientHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / Math.max(height, 1)
    camera.updateProjectionMatrix()
    layout = gridLayout(cards.length, width, height)
    const units = introUnits(cards.length)
    const introVh = units * INTRO_VH
    const panVh = layout.extraRows * PAN_VH
    const total = Math.max(introVh + panVh + HOLD_VH, 1)
    section.style.height = `${Math.round(100 + total)}vh`
    scrollMap = { intro: introVh / total, panStart: introVh / total, pan: panVh / total }
    const viewHeight = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180)
    const viewWidth = viewHeight * camera.aspect
    const closestZ = coarse ? 2.5 : 3.2
    const magnification = CAM_Z / (CAM_Z - closestZ)
    cardFit = Math.min(1, (viewWidth * 0.86) / (CARD_W * magnification))
    const heading = stage.querySelector('[data-project-heading]')
    if (heading instanceof HTMLElement) {
      const cut = Math.ceil(heading.getBoundingClientRect().bottom - stage.getBoundingClientRect().top) + 12
      renderer.domElement.style.clipPath = `inset(${Math.max(cut, 0)}px 0 0 0)`
    }
    readScroll()
  }
  resize()

  const stageObserver = new IntersectionObserver(
    ([entry]) => {
      active = entry?.isIntersecting ?? true
      kick()
    },
    { rootMargin: '250px' },
  )
  stageObserver.observe(stage)

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2(9, 9)
  let pointerX = 0
  let pointerY = 0
  let downX = 0
  let downY = 0
  let hovered = -1

  const projectPointer = (event: PointerEvent) => {
    const bounds = stage.getBoundingClientRect()
    pointerX = event.clientX - bounds.left
    pointerY = event.clientY - bounds.top
    ndc.set((pointerX / bounds.width) * 2 - 1, -(pointerY / bounds.height) * 2 + 1)
  }
  const pick = () => {
    raycaster.setFromCamera(ndc, camera)
    const hits = raycaster.intersectObjects(
      cards.filter((card) => (card.material.uniforms.uOpacity.value as number) > 0.3).map((card) => card.mesh),
    )
    hovered = hits.length ? (hits[0].object.userData.index as number) : -1
  }
  const onMove = (event: PointerEvent) => projectPointer(event)
  const onLeave = () => ndc.set(9, 9)
  const onDown = (event: PointerEvent) => {
    downX = event.clientX
    downY = event.clientY
    projectPointer(event)
  }
  const onUp = (event: PointerEvent) => {
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > 8) return
    projectPointer(event)
    pick()
    if (hovered >= 0) onSelect(hovered)
  }

  stage.addEventListener('pointermove', onMove)
  stage.addEventListener('pointerleave', onLeave)
  stage.addEventListener('pointerdown', onDown)
  stage.addEventListener('pointerup', onUp)
  window.addEventListener('resize', resize)
  window.addEventListener('scroll', readScroll, { passive: true })

  const position = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const flat = new THREE.Vector3()
  const side = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  const basis = new THREE.Matrix4()
  const railQuat = new THREE.Quaternion()
  const identity = new THREE.Quaternion()
  const wobble = new THREE.Quaternion()
  const axis = new THREE.Vector3()
  const end = new THREE.Vector3()
  const control = new THREE.Vector3()
  const goal = new THREE.Vector3()
  const xAxis = new THREE.Vector3()
  let frame = 0
  let last = performance.now()
  const title = tooltip.querySelector('[data-t]')
  const subtitle = tooltip.querySelector('[data-s]')
  const category = tooltip.querySelector('[data-c]')

  const tick = (now: number) => {
    if (document.hidden || !active) return
    frame = requestAnimationFrame(tick)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (!active) return
    progress += (target - progress) * (1 - Math.exp(-4.2 * dt))
    if (Math.abs(target - progress) < 1e-5) progress = target
    const units = introUnits(cards.length)
    const introT = scrollMap.intro > 0 ? clamp01(progress / scrollMap.intro) : 1
    const panT = scrollMap.pan > 0 ? clamp01((progress - scrollMap.panStart) / scrollMap.pan) : 0
    const panY = layout.overflow * panT
    cards.forEach((card, index) => {
      const state = cardProgress(introT, index, units)
      sample(linger(state.rail), position, tangent)
      flat.set(tangent.x, 0, tangent.z)
      if (flat.lengthSq() < 1e-4) flat.set(1, 0, 0)
      flat.normalize()
      side.crossVectors(flat, up).normalize()
      if (side.z < 0) side.negate()
      xAxis.crossVectors(up, side).normalize()
      basis.makeBasis(xAxis, up, side)
      railQuat.setFromRotationMatrix(basis)
      const cell = layout.cells[index]
      const cardScale = (CARD_W * cardFit) / ASPECT
      if (state.fly <= 0) {
        card.mesh.position.copy(position)
        card.mesh.quaternion.copy(railQuat)
        card.mesh.scale.setScalar(cardScale)
      } else {
        sample(1, end, tangent)
        goal.set(cell.x, cell.y + panY, 0)
        control.set(cell.x + cell.side * layout.cellW * 0.9, cell.y + panY + cell.vert * layout.cellH * 1.6, 1.2)
        const t = easeInOutCubic(state.fly)
        const n = 1 - t
        card.mesh.position.set(
          n * n * end.x + 2 * n * t * control.x + t * t * goal.x,
          n * n * end.y + 2 * n * t * control.y + t * t * goal.y,
          n * n * end.z + 2 * n * t * control.z + t * t * goal.z,
        )
        identity.identity()
        card.mesh.quaternion.copy(railQuat).slerp(identity, t)
        wobble.setFromAxisAngle(axis.set(0, 0, 1), Math.sin(Math.PI * t) * 0.18 * (cell.side || cell.vert || 1))
        card.mesh.quaternion.multiply(wobble)
        card.mesh.scale.setScalar(THREE.MathUtils.lerp(cardScale, layout.cellH, t))
      }
      card.mesh.renderOrder = Math.round(card.mesh.position.z * 100)
      card.hover += ((index === hovered ? 1 : 0) - card.hover) * (1 - Math.exp(-10 * dt))
      card.material.uniforms.uHover.value = card.hover
      card.mesh.scale.multiplyScalar(1 + card.hover * 0.05)
      card.material.uniforms.uOpacity.value = state.opacity
      card.mesh.visible = state.opacity > 0.001
    })
    scene.updateMatrixWorld(true)
    pick()
    stage.style.cursor = hovered >= 0 ? 'pointer' : ''
    if (hovered >= 0 && title && subtitle && category) {
      const project = cards[hovered].project
      if (tooltip.dataset.id !== project.id) {
        tooltip.dataset.id = project.id
        title.textContent = project.title
        subtitle.textContent = project.subtitle
        category.textContent = project.category
      }
      tooltip.style.opacity = '1'
      tooltip.style.transform = `translate(${Math.max(8, Math.min(pointerX + 18, width - tooltip.offsetWidth - 8))}px, ${Math.max(8, Math.min(pointerY + 18, height - tooltip.offsetHeight - 8))}px)`
    } else {
      tooltip.style.opacity = '0'
    }
    renderer.render(scene, camera)
    stage.dataset.sceneReady = '1'
  }
  kick = () => {
    cancelAnimationFrame(frame)
    if (!active || document.hidden) return
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }
  const onVisibility = () => {
    kick()
  }
  document.addEventListener('visibilitychange', onVisibility)
  kick()

  return () => {
    cancelAnimationFrame(frame)
    textureObserver.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
    stageObserver.disconnect()
    window.removeEventListener('resize', resize)
    window.removeEventListener('scroll', readScroll)
    stage.removeEventListener('pointermove', onMove)
    stage.removeEventListener('pointerleave', onLeave)
    stage.removeEventListener('pointerdown', onDown)
    stage.removeEventListener('pointerup', onUp)
    cards.forEach((card) => {
      card.material.dispose()
      card.texture?.dispose()
    })
    geometry.dispose()
    placeholder.dispose()
    renderer.dispose()
    renderer.domElement.remove()
    section.style.height = ''
  }
}
