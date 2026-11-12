import * as THREE from 'three'

const VERT = `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uTravel;
  uniform float uDepth;
  uniform vec2 uMouse;
  uniform float uSpeed;
  uniform float uPixelRatio;
  uniform float uClock;
  uniform float uAspect;
  uniform vec3 uClick[4];
  varying float vAlpha;
  varying float vSeed;
  varying float vSize;
  void main() {
    vec3 star = position;
    float drift = 0.4 + aSeed * 0.6;
    star.x += sin(uTime * (0.12 + aSeed * 0.2) + aSeed * 31.0) * drift;
    star.y += cos(uTime * (0.10 + aSeed * 0.18) + aSeed * 17.0) * drift;

    float depthSpan = uDepth + 6.0;
    float wrapped = mod(star.z + uTravel + uTime * 0.25 + uDepth, depthSpan) - uDepth;
    star.z = wrapped;
    float closeness = clamp((wrapped + uDepth) / depthSpan, 0.0, 1.0);
    star.xy += uMouse * closeness * closeness * 1.6;

    vec4 view = modelViewMatrix * vec4(star, 1.0);
    vec2 screen = (projectionMatrix * view).xy / (projectionMatrix * view).w;
    for (int slot = 0; slot < 4; slot++) {
      float age = uClock - uClick[slot].z;
      if (age > 0.0 && age < 4.0) {
        vec2 offset = screen - uClick[slot].xy;
        offset.x *= uAspect;
        float distance = length(offset);
        float radius = 0.15 + age * 0.55;
        float ring = exp(-distance * distance / (radius * radius * 0.35));
        float burst = age * exp(-age * 2.2) * 6.0;
        vec2 push = distance > 0.0001 ? offset / distance : vec2(0.0, 1.0);
        push.x /= uAspect;
        view.xy += push * ring * burst * 0.22 * -view.z;
      }
    }

    gl_Position = projectionMatrix * view;
    float twinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + uSpeed * 0.6) * (60.0 / -view.z) * (0.8 + closeness * closeness * 1.8);
    float fromFar = smoothstep(-uDepth, -uDepth + 14.0, wrapped);
    float fromNear = 1.0 - smoothstep(2.0, 5.5, wrapped);
    vAlpha = fromFar * fromNear * twinkle * (0.35 + aSeed * 0.65) * (0.55 + closeness * 0.75);
    vSeed = aSeed;
    vSize = aSize;
  }
`

const FRAG = `
  varying float vAlpha;
  varying float vSeed;
  varying float vSize;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float core = exp(-d * d * 60.0);
    float halo = exp(-d * d * 7.0) * (0.35 + vSize * 0.04);
    float a = (core + halo) * vAlpha;
    if (a < 0.003) discard;
    vec3 col = mix(vec3(0.75, 0.03, 0.08), vec3(1.0, 0.32, 0.30), core * (0.4 + vSeed * 0.6));
    gl_FragColor = vec4(col * a, a);
  }
`

const IGNORE = 'a,button,input,textarea,select,label,video,img,nav,[role="button"],[data-no-ripple],.glass,.glass-chip,.glass-red'

export function mountStarfield(host: HTMLElement) {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
  } catch {
    return () => {}
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200)
  camera.position.set(0, 0, 6)

  const count = coarse ? 900 : 2200
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const seeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const radius = Math.random() ** 0.7 * 26
    const angle = Math.random() * Math.PI * 2
    positions[i * 3] = Math.cos(angle) * radius * 1.4 + (Math.random() - 0.5) * 4
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.9 + (Math.random() - 0.5) * 4
    positions[i * 3 + 2] = -Math.random() * 70
    sizes[i] = Math.random() < 0.06 ? 7 + Math.random() * 11 : 1.1 + Math.random() * 3.4
    seeds[i] = Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const clicks = [0, 1, 2, 3].map(() => new THREE.Vector3(0, 0, -99))
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTravel: { value: 0 },
      uDepth: { value: 70 },
      uMouse: { value: new THREE.Vector2() },
      uSpeed: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uClock: { value: 0 },
      uAspect: { value: 1 },
      uClick: { value: clicks },
    },
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  scene.add(points)

  let travel = 0
  let smoothed = 0
  let lastScroll = window.scrollY
  let speed = 0
  let frame = 0
  let previous = performance.now()
  const started = performance.now()

  const draw = (now = performance.now()) => {
    const dt = Math.min((now - previous) / 1000, 0.05)
    previous = now
    const scroll = window.scrollY
    travel += (scroll - lastScroll) * 0.02
    lastScroll = scroll
    const before = smoothed
    smoothed += (travel - smoothed) * (1 - Math.exp(-6 * dt))
    const instant = Math.min(Math.abs(smoothed - before) / Math.max(dt, 0.001) / 25, 1)
    speed += (instant - speed) * (1 - Math.exp(-8 * dt))
    const uniforms = material.uniforms
    uniforms.uTime.value = reduced ? 0 : (now - started) / 1000
    uniforms.uTravel.value = smoothed
    uniforms.uSpeed.value = speed
    uniforms.uClock.value = (now - started) / 1000
    const mouse = uniforms.uMouse.value as THREE.Vector2
    mouse.x += (pointer.x - mouse.x) * (1 - Math.exp(-3 * dt))
    mouse.y += (pointer.y - mouse.y) * (1 - Math.exp(-3 * dt))
    renderer.render(scene, camera)
  }

  const resize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / Math.max(height, 1)
    camera.updateProjectionMatrix()
    material.uniforms.uAspect.value = width / Math.max(height, 1)
    if (reduced || document.hidden) draw()
  }
  resize()

  const pointer = { x: 0, y: 0 }
  const onMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
  }

  let slot = 0
  const onDown = (event: PointerEvent) => {
    const target = event.target
    if (!(target instanceof Element) || target.closest(IGNORE)) return
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -((event.clientY / window.innerHeight) * 2 - 1)
    clicks[slot++ % 4].set(x, y, (performance.now() - started) / 1000)
    if (reduced) return
    const ring = document.createElement('span')
    ring.className = 'pf-ripple'
    ring.style.left = `${event.clientX}px`
    ring.style.top = `${event.clientY}px`
    host.appendChild(ring)
    ring.addEventListener('animationend', () => ring.remove(), { once: true })
  }

  const tick = (now: number) => {
    if (document.hidden || reduced) return
    frame = requestAnimationFrame(tick)
    draw(now)
  }
  const onVisibility = () => {
    if (document.hidden || reduced) {
      cancelAnimationFrame(frame)
      return
    }
    previous = performance.now()
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(tick)
  }

  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  if (!reduced) frame = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frame)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
