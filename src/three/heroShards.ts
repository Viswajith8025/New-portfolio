import * as THREE from 'three'

type Vec2 = [number, number]
type Spring = { position: number; velocity: number }

type Shard = {
  mesh: THREE.Mesh
  edge: THREE.LineSegments
  material: THREE.MeshPhysicalMaterial
  center: THREE.Vector2
  dir: THREE.Vector3
  spin: THREE.Vector3
  lift: number
  phase: number
  x: Spring
  y: Spring
  targetX: number
  targetY: number
}

const P22: Vec2 = [0.22, 0]
const P515: Vec2 = [0.515, 0]
const P84: Vec2 = [0.84, 0]
const P34: Vec2 = [0.34, 1]
const P865: Vec2 = [0.865, 1]
const INNER_A: Vec2 = [0.385, 0.72]
const INNER_B: Vec2 = [0.48, 0.62]
const INNER_C: Vec2 = [0.716, 0.49]
const POLYGONS: Vec2[][] = [
  [[0, 0], P22, INNER_B, INNER_A, P34, [0, 1]],
  [P22, P515, INNER_C, INNER_B],
  [P515, P84, INNER_C],
  [P84, [1, 0], [1, 1], P865, INNER_C],
  [INNER_A, INNER_B, INNER_C, P865, P34],
]
function panelRect(width: number, height: number) {
  const mobile = window.matchMedia('(max-width: 767px)').matches
  const left = mobile ? Math.min(Math.max(width * 0.05, 16), 22) : width * 0.055
  const top = Math.max(height * 0.085, mobile ? 84 : 96)
  const panelHeight = mobile ? height * 0.5 : height - top - height * 0.085
  return { left, top, width: width - left * 2, height: panelHeight, mobile }
}

function insetPolygon(points: Vec2[], amount: number) {
  const count = points.length
  const area = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % count]
    return sum + (point[0] * next[1] - next[0] * point[1])
  }, 0)
  const winding = area > 0 ? 1 : -1
  const edges = points.map((point, index) => {
    const next = points[(index + 1) % count]
    let x = -(next[1] - point[1])
    let y = next[0] - point[0]
    const length = Math.hypot(x, y) || 1
    x = (x / length) * winding * amount
    y = (y / length) * winding * amount
    return [
      [point[0] + x, point[1] + y],
      [next[0] + x, next[1] + y],
    ] as [Vec2, Vec2]
  })
  return edges.map((edge, index) => {
    const previous = edges[(index - 1 + count) % count]
    const [a0, a1] = previous
    const [b0, b1] = edge
    const cx = a1[0] - a0[0]
    const cy = a1[1] - a0[1]
    const dx = b1[0] - b0[0]
    const dy = b1[1] - b0[1]
    const det = cx * dy - cy * dx
    if (Math.abs(det) < 1e-9) return b0
    const t = ((b0[0] - a0[0]) * dy - (b0[1] - a0[1]) * dx) / det
    return [a0[0] + cx * t, a0[1] + cy * t] as Vec2
  })
}

function roundedShape(points: Vec2[], radius: number) {
  const shape = new THREE.Shape()
  const count = points.length
  for (let i = 0; i < count; i++) {
    const point = points[i]
    const previous = points[(i - 1 + count) % count]
    const next = points[(i + 1) % count]
    const back = [previous[0] - point[0], previous[1] - point[1]]
    const forward = [next[0] - point[0], next[1] - point[1]]
    const backLen = Math.hypot(back[0], back[1]) || 1
    const forwardLen = Math.hypot(forward[0], forward[1]) || 1
    const trim = Math.min(radius, backLen * 0.4, forwardLen * 0.4)
    const start: Vec2 = [point[0] + (back[0] / backLen) * trim, point[1] + (back[1] / backLen) * trim]
    const end: Vec2 = [point[0] + (forward[0] / forwardLen) * trim, point[1] + (forward[1] / forwardLen) * trim]
    if (i === 0) shape.moveTo(start[0], start[1])
    else shape.lineTo(start[0], start[1])
    shape.quadraticCurveTo(point[0], point[1], end[0], end[1])
  }
  shape.closePath()
  return shape
}

function stepSpring(state: Spring, target: number, dt: number) {
  let left = dt
  const step = 1 / 120
  while (left > 1e-6) {
    const h = Math.min(step, left)
    const acceleration = 85 * (target - state.position) - 14 * state.velocity
    state.velocity += acceleration * h
    state.position += state.velocity * h
    left -= h
  }
}

function clampDrag(value: number, size: number) {
  const limit = size * 0.12
  return Math.max(-limit, Math.min(limit, value))
}

function tintIridescence(shader: { uniforms: Record<string, { value: unknown }>; fragmentShader: string }, color: THREE.Color) {
  shader.uniforms.redReflection = { value: color }
  shader.fragmentShader = `uniform vec3 redReflection;\n${shader.fragmentShader}`
  const source = 'material.iridescenceFresnel = mix('
  if (!shader.fragmentShader.includes(source)) return
  shader.fragmentShader = shader.fragmentShader.replace(
    source,
    `iridescenceFresnelDielectric = redReflection * dot(iridescenceFresnelDielectric, vec3(0.333333));
         iridescenceFresnelMetallic = redReflection * dot(iridescenceFresnelMetallic, vec3(0.333333));
         material.iridescenceFresnel = mix(`,
  )
}

export function mountHeroShards(root: HTMLElement, host: HTMLElement, copy: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const reflection = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--glass-reflection').trim() || '#8b1118')
  const highlight = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--glass-highlight').trim() || '#d94a52')

  const renderer = new THREE.WebGLRenderer({ antialias: !coarse, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  envScene.add(new THREE.HemisphereLight(0xff2a3b, 0x4a0a12, 4))
  const env = pmrem.fromScene(envScene, 0.04)
  scene.environment = env.texture
  scene.environmentIntensity = 0.55

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  camera.position.set(0, 0, 10)
  const group = new THREE.Group()
  scene.add(group)
  scene.add(new THREE.AmbientLight(0xffffff, 0.08))
  const key = new THREE.DirectionalLight(0xffe8e8, 0.7)
  key.position.set(-4, 5, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(highlight, 0.45)
  rim.position.set(5, -3, 2)
  scene.add(rim)
  const point = new THREE.PointLight(reflection, 0, 6, 1.6)
  point.position.set(0, 0, 1.5)
  scene.add(point)

  const texture = new THREE.TextureLoader().load(copy.dataset.hero || '/hero/hero-bg.jpg', () => {
    ready = true
    root.dataset.sceneReady = '1'
  })
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  let ready = false

  const base = new THREE.MeshPhysicalMaterial({
    color: 0x17171b,
    roughness: 0.36,
    metalness: 0,
    specularIntensity: 0.35,
    specularColor: highlight,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    iridescence: 0.35,
    iridescenceIOR: 1.5,
    iridescenceThicknessRange: [380, 620],
    emissive: 0xffffff,
    emissiveMap: texture,
    emissiveIntensity: 0.92,
    envMapIntensity: 0.28,
  })
  const lineMaterial = new THREE.LineBasicMaterial({ color: highlight, transparent: true, opacity: 0.55 })
  const materials = POLYGONS.map(() => {
    const material = base.clone()
    material.onBeforeCompile = (shader) => tintIridescence(shader, reflection)
    material.customProgramCacheKey = () => 'muted-red-iridescence'
    return material
  })

  let shards: Shard[] = []
  let panelW = 1
  let panelH = 1
  let mobile = false
  let rect = panelRect(1, 1)

  const disposeShards = () => {
    shards.forEach((shard) => {
      group.remove(shard.mesh)
      shard.mesh.geometry.dispose()
      shard.edge.geometry.dispose()
    })
    shards = []
  }

  const rebuild = (keep?: Shard[]) => {
    const previous = keep ?? shards
    disposeShards()
    POLYGONS.forEach((polygon, index) => {
      const mapped = polygon.map((point) => {
        let x = point[0]
        let y = point[1]
        if (mobile) [x, y] = [y, x]
        return [(x - 0.5) * panelW, (0.5 - y) * panelH] as Vec2
      })
      const shape = roundedShape(insetPolygon(mapped, Math.min(panelW, panelH) * 0.012), Math.min(panelW, panelH) * 0.035)
      const depth = Math.min(panelW, panelH) * 0.08
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: depth * 0.55,
        bevelSize: depth * 0.45,
        bevelSegments: 3,
        curveSegments: 8,
      })
      geometry.translate(0, 0, -depth)
      const position = geometry.attributes.position
      const uv = geometry.attributes.uv
      const aspect = 16 / 9
      const panelAspect = panelW / panelH
      let fitX = 1
      let fitY = 1
      if (panelAspect > aspect) fitY = aspect / panelAspect
      else fitX = panelAspect / aspect
      for (let i = 0; i < position.count; i++) {
        const nx = position.getX(i) / panelW + 0.5
        const ny = position.getY(i) / panelH + 0.5
        let u: number
        let v: number
        if (mobile) {
          // After the x/y swap, screen X is texture U. The portrait sits in the
          // right half of the plate, so sample that band or the face falls off.
          const uStart = 0.6
          u = uStart + nx * (1 - uStart)
          v = ny * fitY + (1 - fitY) / 2
        } else {
          // The studio plate keeps the face near 69% of the width. Hold that
          // point in the right side of the panel so a tall 768px frame still
          // contains the whole face.
          const u0 = Math.min(Math.max(0.69 - 0.72 * fitX, 0), 1 - fitX)
          u = u0 + nx * fitX
          v = ny * fitY + (1 - fitY) / 2
        }
        uv.setXY(i, Math.min(1, Math.max(0, u)), Math.min(1, Math.max(0, v)))
      }
      uv.needsUpdate = true
      const material = materials[index]
      const mesh = new THREE.Mesh(geometry, material)
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), lineMaterial)
      mesh.add(edge)
      const center = mapped.reduce((sum, point) => [sum[0] + point[0] / mapped.length, sum[1] + point[1] / mapped.length] as Vec2, [0, 0] as Vec2)
      const direction = new THREE.Vector3(center[0] / panelW, center[1] / panelH, 0.4 + (index % 3) * 0.25).normalize()
      const prior = previous[index]
      mesh.userData.idx = index
      group.add(mesh)
      shards.push({
        mesh,
        edge,
        material,
        center: new THREE.Vector2(center[0], center[1]),
        dir: direction,
        spin: prior?.spin ?? new THREE.Vector3((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.8),
        lift: prior?.lift ?? 0,
        phase: index * 1.37,
        x: prior?.x ?? { position: 0, velocity: 0 },
        y: prior?.y ?? { position: 0, velocity: 0 },
        targetX: prior?.targetX ?? 0,
        targetY: prior?.targetY ?? 0,
      })
    })
  }

  let resizeTimer = 0
  const layout = () => {
    const width = root.clientWidth
    const height = root.clientHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / Math.max(height, 1)
    rect = panelRect(width, height)
    const worldPerPixel = (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / height
    panelW = rect.width * worldPerPixel
    panelH = rect.height * worldPerPixel
    group.position.set(0, -((rect.top - (height - rect.top - rect.height)) / 2) * worldPerPixel, 0)
    const switched = mobile !== rect.mobile
    mobile = rect.mobile
    camera.updateProjectionMatrix()
    window.clearTimeout(resizeTimer)
    if (shards.length === 0 || switched) rebuild(shards)
    else resizeTimer = window.setTimeout(() => rebuild(shards), 150)
    if (rect.mobile) {
      const copyTop = rect.top + rect.height + Math.min(height * 0.02, 16)
      Object.assign(copy.style, {
        left: `${rect.left}px`,
        top: `${copyTop}px`,
        width: `${rect.width}px`,
        height: `${Math.max(height - copyTop - height * 0.03, 180)}px`,
      })
    } else {
      Object.assign(copy.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      })
    }
  }
  layout()

  const resizeObserver = new ResizeObserver(layout)
  resizeObserver.observe(root)

  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  const dragPlane = new THREE.Plane()
  const hit = new THREE.Vector3()
  const localHit = new THREE.Vector3()
  let dragIndex = -1
  let pointerId: number | null = null
  let dragZ = 0
  const dragOrigin = new THREE.Vector2()
  let inside = false
  let hover = -1
  const tilt = { x: 0, y: 0 }
  let scroll = 0
  let visible = true
  let pageHidden = document.hidden
  let frame = 0
  let last = performance.now()

  const placePointer = (event: PointerEvent) => {
    const bounds = root.getBoundingClientRect()
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    inside = true
  }

  const endDrag = () => {
    if (dragIndex < 0) return
    const shard = shards[dragIndex]
    shard.targetX = 0
    shard.targetY = 0
    dragIndex = -1
    root.classList.remove('shard-dragging')
    host.style.cursor = ''
    if (pointerId !== null && root.hasPointerCapture(pointerId)) root.releasePointerCapture(pointerId)
    pointerId = null
  }

  const onMove = (event: PointerEvent) => {
    placePointer(event)
    if (dragIndex >= 0 && event.pointerId === pointerId) {
      raycaster.setFromCamera(pointer, camera)
      if (raycaster.ray.intersectPlane(dragPlane, hit)) {
        group.worldToLocal(localHit.copy(hit))
        const shard = shards[dragIndex]
        shard.targetX = clampDrag(dragOrigin.x + localHit.x - grab.x, panelW)
        shard.targetY = clampDrag(dragOrigin.y + localHit.y - grab.y, panelH)
      }
    }
  }
  const grab = new THREE.Vector3()
  const onLeave = () => {
    inside = false
  }
  const onDown = (event: PointerEvent) => {
    if (dragIndex >= 0) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const target = event.target
    if (target instanceof Element && target.closest('a, button, input, textarea, nav')) return
    const bounds = root.getBoundingClientRect()
    if (bounds.top < -root.clientHeight * 0.04) return
    placePointer(event)
    group.updateMatrixWorld(true)
    raycaster.setFromCamera(pointer, camera)
    const hitMesh = raycaster.intersectObjects(shards.map((shard) => shard.mesh), false)[0]
    if (!hitMesh) return
    dragIndex = hitMesh.object.userData.idx as number
    pointerId = event.pointerId
    const shard = shards[dragIndex]
    dragZ = shard.mesh.position.z
    dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), hitMesh.point)
    group.worldToLocal(grab.copy(hitMesh.point))
    dragOrigin.set(shard.x.position, shard.y.position)
    root.setPointerCapture(event.pointerId)
    root.classList.add('shard-dragging')
    host.style.cursor = 'grabbing'
    event.preventDefault()
  }

  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true
    if (!visible) endDrag()
  })
  visibility.observe(root)

  root.addEventListener('pointermove', onMove)
  root.addEventListener('pointerleave', onLeave)
  root.addEventListener('pointerdown', onDown)
  root.addEventListener('pointerup', endDrag)
  root.addEventListener('pointercancel', endDrag)
  root.addEventListener('lostpointercapture', endDrag)
  window.addEventListener('blur', endDrag)

  const onVisibility = () => {
    pageHidden = document.hidden
    if (!pageHidden) {
      last = performance.now()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(tick)
    }
  }
  window.addEventListener('visibilitychange', onVisibility)

  const tick = (now: number) => {
    if (pageHidden) return
    frame = requestAnimationFrame(tick)
    if (!visible) {
      last = now
      return
    }
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const ease = (k: number) => 1 - Math.exp(-k * dt)
    const targetX = dragIndex >= 0 ? tilt.x : inside && !coarse ? -pointer.y * THREE.MathUtils.degToRad(5.5) : 0
    const targetY = dragIndex >= 0 ? tilt.y : inside && !coarse ? pointer.x * THREE.MathUtils.degToRad(7) : 0
    tilt.x += (targetX - tilt.x) * ease(5)
    tilt.y += (targetY - tilt.y) * ease(5)
    const bounds = root.getBoundingClientRect()
    const progress = THREE.MathUtils.clamp(-bounds.top / (bounds.height * 0.8), 0, 1)
    scroll += (progress - scroll) * ease(8)
    const explode = scroll * scroll * (3 - 2 * scroll)
    group.rotation.set(tilt.x, tilt.y, 0)
    group.updateMatrixWorld(true)
    hover = -1
    if (inside && !coarse && explode < 0.05 && dragIndex < 0) {
      raycaster.setFromCamera(pointer, camera)
      const hitMesh = raycaster.intersectObjects(shards.map((shard) => shard.mesh), false)[0]
      if (hitMesh) {
        hover = hitMesh.object.userData.idx as number
        point.position.set(hitMesh.point.x, hitMesh.point.y, hitMesh.point.z + 1.2)
      }
    }
    point.intensity += ((hover >= 0 || dragIndex >= 0 ? 1.4 : 0) - point.intensity) * ease(6)
    const seconds = now / 1000
    shards.forEach((shard, index) => {
      const held = dragIndex === index || shard.x.position !== 0 || shard.y.position !== 0
      shard.lift += ((held ? 0 : hover === index ? 1 : 0) - shard.lift) * ease(7)
      stepSpring(shard.x, shard.targetX, dt)
      stepSpring(shard.y, shard.targetY, dt)
      const idle = reduced || held ? 0 : Math.sin(seconds * 0.8 + shard.phase) * 0.03
      const distance = explode * Math.max(panelW, panelH) * 0.9
      shard.mesh.position.set(
        shard.dir.x * distance + shard.x.position,
        shard.dir.y * distance + shard.y.position,
        (dragIndex === index ? dragZ : idle + shard.lift * 0.35) + shard.dir.z * distance * 0.6,
      )
      shard.mesh.rotation.set(
        shard.spin.x * explode + shard.lift * -0.05 * pointer.y + shard.y.position * -0.06,
        shard.spin.y * explode + shard.lift * 0.06 * pointer.x + shard.x.position * 0.06,
        shard.spin.z * explode + shard.x.position * 0.025,
      )
      shard.material.iridescence = 0.35
      shard.material.emissiveIntensity = (ready ? 0.92 : 0) * (1 - explode * 0.5) + shard.lift * 0.08
    })
    copy.style.transform = `perspective(1400px) rotateX(${(-tilt.x * 180) / Math.PI}deg) rotateY(${(tilt.y * 180) / Math.PI}deg) translate3d(${-explode * 140}px, ${-explode * 60}px, ${explode * 80}px)`
    copy.style.opacity = String(Math.max(0, 1 - explode * 1.2))
    renderer.render(scene, camera)
  }
  frame = requestAnimationFrame(tick)
  window.setTimeout(() => {
    root.dataset.sceneReady = '1'
  }, 6000)

  return () => {
    cancelAnimationFrame(frame)
    window.clearTimeout(resizeTimer)
    window.removeEventListener('visibilitychange', onVisibility)
    resizeObserver.disconnect()
    visibility.disconnect()
    endDrag()
    root.removeEventListener('pointermove', onMove)
    root.removeEventListener('pointerleave', onLeave)
    root.removeEventListener('pointerdown', onDown)
    root.removeEventListener('pointerup', endDrag)
    root.removeEventListener('pointercancel', endDrag)
    root.removeEventListener('lostpointercapture', endDrag)
    window.removeEventListener('blur', endDrag)
    disposeShards()
    materials.forEach((material) => material.dispose())
    base.dispose()
    lineMaterial.dispose()
    texture.dispose()
    env.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
