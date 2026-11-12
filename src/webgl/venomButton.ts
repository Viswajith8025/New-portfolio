type Strand = {
  angle: number
  rest: number
  length: number
  tipX: number
  tipY: number
  vx: number
  vy: number
  alive: boolean
}

type Ripple = { x: number; y: number; age: number }

const VERT = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uPress;
  uniform float uTime;
  uniform vec4 uStrands[6];
  uniform float uStrandCount;
  uniform vec3 uRipples[6];
  uniform float uRippleCount;
  uniform sampler2D uLabel;
  float sdPill(vec2 p, vec2 halfSize, float radius) {
    vec2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }
  float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
    return length(pa - ba * h) - r;
  }
  void main() {
    vec2 pixel = (vUv * uRes) - uRes * 0.5;
    vec2 halfSize = vec2(max(uRes.x * 0.5 - 150.0, 70.0), 30.0);
    float body = sdPill(pixel, halfSize, 30.0);
    float field = body;
    for (int i = 0; i < 6; i++) {
      if (float(i) >= uStrandCount) break;
      vec4 strand = uStrands[i];
      float radius = mix(7.0, 1.4, smoothstep(0.0, 160.0, length(strand.zw - strand.xy)));
      field = min(field, sdCapsule(pixel, strand.xy, strand.zw, radius));
    }
    float edge = smoothstep(1.5, -1.2, field);
    if (edge < 0.01) discard;
    vec2 light = normalize(vec2(-0.45, -0.8));
    float dome = clamp(0.55 + 0.45 * dot(normalize(pixel / max(halfSize, vec2(1.0))), light), 0.0, 1.0);
    vec3 col = mix(vec3(0.01, 0.005, 0.008), vec3(0.08, 0.02, 0.03), dome);
    float rim = smoothstep(8.0, 0.0, abs(field));
    col += vec3(1.0, 0.07, 0.22) * rim * 0.85;
    col += vec3(1.0, 0.15, 0.25) * exp(-max(field, 0.0) * 0.08) * 0.25;
    for (int i = 0; i < 6; i++) {
      if (float(i) >= uRippleCount) break;
      vec3 ripple = uRipples[i];
      float ring = abs(length(pixel - ripple.xy) - ripple.z);
      col += vec3(1.0, 0.12, 0.28) * smoothstep(6.0, 0.0, ring) * (1.0 - ripple.z / 180.0);
    }
    col += vec3(1.0, 0.08, 0.16) * uPress * 0.18;
    col += texture2D(uLabel, vec2(0.5)).rgb * 0.0;
    gl_FragColor = vec4(col, edge);
  }
`

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export type VenomHandle = {
  stop: () => void
  setLabel: (next: string) => void
}

export function mountVenom(canvas: HTMLCanvasElement, label: string): VenomHandle | null {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true })
  if (!gl) return null
  const vertex = compile(gl, gl.VERTEX_SHADER, VERT)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vertex || !fragment) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.bindAttribLocation(program, 0, 'position')
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  const uniforms = {
    uRes: gl.getUniformLocation(program, 'uRes'),
    uMouse: gl.getUniformLocation(program, 'uMouse'),
    uPress: gl.getUniformLocation(program, 'uPress'),
    uTime: gl.getUniformLocation(program, 'uTime'),
    uStrands: gl.getUniformLocation(program, 'uStrands'),
    uStrandCount: gl.getUniformLocation(program, 'uStrandCount'),
    uRipples: gl.getUniformLocation(program, 'uRipples'),
    uRippleCount: gl.getUniformLocation(program, 'uRippleCount'),
    uLabel: gl.getUniformLocation(program, 'uLabel'),
  }
  const strandData = new Float32Array(24)
  const rippleData = new Float32Array(18)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const labelCanvas = document.createElement('canvas')
  labelCanvas.width = 512
  labelCanvas.height = 128
  const ctx = labelCanvas.getContext('2d')
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  const paintLabel = (text: string) => {
    if (!ctx || !texture) return
    ctx.clearRect(0, 0, 512, 128)
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 42px "General Sans", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 256, 64)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, labelCanvas)
  }
  paintLabel(label)

  const strands: Strand[] = Array.from({ length: 6 }, (_, index) => ({
    angle: (index / 6) * Math.PI * 2,
    rest: 18,
    length: 18,
    tipX: 0,
    tipY: 0,
    vx: 0,
    vy: 0,
    alive: false,
  }))
  const ripples: Ripple[] = []
  let pointerX = 0
  let pointerY = 0
  let hovering = false
  let pressed = 0
  let quality = 1
  let frame = 0
  let last = performance.now()
  let lastDraw = 0
  let pointerDistance = 999
  let onScreen = true
  const button = canvas.closest('a, button')

  const resize = () => {
    const bounds = button?.getBoundingClientRect()
    const width = Math.min(Math.ceil((bounds?.width ?? 220) + 320), window.innerWidth)
    const height = Math.ceil((bounds?.height ?? 60) + 320)
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()

  const localPointer = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect()
    pointerX = (event.clientX - bounds.left - bounds.width / 2) * (canvas.width / bounds.width)
    pointerY = (bounds.height / 2 - (event.clientY - bounds.top)) * (canvas.height / bounds.height)
  }
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    localPointer(event)
    const bounds = button?.getBoundingClientRect()
    if (!bounds) return
    const dx = event.clientX - (bounds.left + bounds.width / 2)
    const dy = event.clientY - (bounds.top + bounds.height / 2)
    pointerDistance = Math.hypot(dx, dy)
    hovering = pointerDistance < 220
  }
  const onDown = () => {
    pressed = 1
    if (ripples.length >= 6) ripples.shift()
    ripples.push({ x: pointerX, y: pointerY, age: 0 })
  }
  const onUp = () => {
    pressed = 0
    strands.forEach((strand) => {
      strand.rest *= 0.82
      strand.rest = Math.max(18, strand.rest)
    })
  }
  const onLost = () => {
    const ext = gl.getExtension('WEBGL_lose_context')
    ext?.loseContext()
  }

  button?.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointermove', onMove, { passive: true })
  canvas.addEventListener('webglcontextlost', onLost)

  const stepPhysics = (dt: number) => {
    const halfW = Math.max(canvas.width * 0.5 - 150, 70)
    strands.forEach((strand, index) => {
      if (index >= Math.round(6 * quality)) {
        strand.alive = false
        return
      }
      const originX = Math.cos(strand.angle) * halfW
      const originY = Math.sin(strand.angle) * 30
      if (!hovering) {
        strand.vx += (0 - strand.tipX) * 8 * dt
        strand.vy += (0 - strand.tipY) * 8 * dt
        strand.alive = Math.hypot(strand.tipX, strand.tipY) > 4
      } else {
        strand.alive = true
        const aimX = pointerX - originX
        const aimY = pointerY - originY
        const distance = Math.hypot(aimX, aimY) || 1
        const reach = Math.min(120, distance)
        const targetX = (aimX / distance) * reach
        const targetY = (aimY / distance) * reach
        strand.vx += (targetX - strand.tipX) * 14 * dt
        strand.vy += (targetY - strand.tipY) * 14 * dt + 900 * dt * dt
        const stretch = Math.hypot(strand.tipX, strand.tipY)
        if (stretch > strand.rest * 1.6 || stretch > 160) {
          strand.vx *= -0.45
          strand.vy *= -0.45
          strand.rest = Math.min(160, strand.rest * 1.05)
        }
      }
      strand.vx *= Math.exp(-2.2 * dt)
      strand.vy *= Math.exp(-2.2 * dt)
      strand.tipX += strand.vx * 60 * dt
      strand.tipY += strand.vy * 60 * dt
      const length = Math.hypot(strand.tipX, strand.tipY)
      if (length > 160) {
        strand.tipX *= 160 / length
        strand.tipY *= 160 / length
      }
    })
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].age += dt
      if (ripples[i].age > 0.7) ripples.splice(i, 1)
    }
  }

  const schedule = () => {
    cancelAnimationFrame(frame)
    if (!onScreen || document.hidden) return
    frame = requestAnimationFrame(tick)
  }
  const tick = (now: number) => {
    if (!onScreen || document.hidden) return
    frame = requestAnimationFrame(tick)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const alive = strands.some((strand) => strand.alive) || ripples.length > 0
    if (pointerDistance > 260 && !alive && now - lastDraw < 50) return
    lastDraw = now
    if (dt > 1 / 40) quality = Math.max(0.34, quality - dt)
    else quality = Math.min(1, quality + dt * 0.2)
    const steps = Math.max(1, Math.round((dt / (1 / 240)) * quality))
    const step = dt / steps
    for (let i = 0; i < steps; i++) stepPhysics(step)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindVertexArray(vao)
    const halfW = Math.max(canvas.width * 0.5 - 150, 70)
    strandData.fill(0)
    strands.forEach((strand, index) => {
      const originX = Math.cos(strand.angle) * (strand.alive ? 1 : 0) * halfW
      const originY = Math.sin(strand.angle) * (strand.alive ? 1 : 0) * 30
      strandData[index * 4] = originX
      strandData[index * 4 + 1] = originY
      strandData[index * 4 + 2] = originX + strand.tipX
      strandData[index * 4 + 3] = originY + strand.tipY
    })
    rippleData.fill(0)
    ripples.forEach((ripple, index) => {
      rippleData[index * 3] = ripple.x
      rippleData[index * 3 + 1] = ripple.y
      rippleData[index * 3 + 2] = ripple.age * 180
    })
    gl.uniform2f(uniforms.uRes, canvas.width, canvas.height)
    gl.uniform2f(uniforms.uMouse, pointerX, pointerY)
    gl.uniform1f(uniforms.uPress, pressed)
    gl.uniform1f(uniforms.uTime, now / 1000)
    gl.uniform4fv(uniforms.uStrands, strandData)
    gl.uniform1f(uniforms.uStrandCount, strands.filter((strand) => strand.alive).length)
    gl.uniform3fv(uniforms.uRipples, rippleData)
    gl.uniform1f(uniforms.uRippleCount, ripples.length)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(uniforms.uLabel, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  const resizeObserver = new ResizeObserver(resize)
  const screenObserver = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry?.isIntersecting ?? true
      if (onScreen) {
        last = performance.now()
        schedule()
      } else {
        cancelAnimationFrame(frame)
      }
    },
    { rootMargin: '100px' },
  )
  const onVisibility = () => {
    if (document.hidden || !onScreen) {
      cancelAnimationFrame(frame)
      return
    }
    last = performance.now()
    schedule()
  }
  document.addEventListener('visibilitychange', onVisibility)
  if (button) {
    resizeObserver.observe(button)
    screenObserver.observe(button)
  }
  schedule()

  return {
    setLabel: paintLabel,
    stop: () => {
    cancelAnimationFrame(frame)
    document.removeEventListener('visibilitychange', onVisibility)
    resizeObserver.disconnect()
    screenObserver.disconnect()
    button?.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('webglcontextlost', onLost)
    gl.deleteProgram(program)
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    gl.deleteBuffer(buffer)
    gl.deleteTexture(texture)
    gl.deleteVertexArray(vao)
    },
  }
}
