import { useEffect, useRef } from 'react'

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; hot: boolean }
type Bolt = { pts: number[]; life: number; max: number; width: number; bright: boolean }

function bolt(x: number, y: number, angle: number, length: number, points: number[]) {
  points.length = 0
  const segments = 4 + Math.floor(Math.random() * 4)
  let px = x
  let py = y
  points.push(px, py)
  for (let i = 1; i <= segments; i++) {
    const next = angle + (Math.random() - 0.5) * 1.1
    const step = length / segments
    px += Math.cos(next) * step
    py += Math.sin(next) * step
    points.push(px, py)
  }
}

export function SparkCursor() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const context = canvas.getContext('2d')
    if (!context) return

    const particles: Particle[] = Array.from({ length: 160 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, hot: false,
    }))
    const bolts: Bolt[] = Array.from({ length: 24 }, () => ({ pts: [], life: 0, max: 1, width: 1, bright: false }))
    const trail: { x: number; y: number; t: number }[] = []
    let particleIndex = 0
    let boltIndex = 0
    let x = -9999
    let y = -9999
    let lastX = -9999
    let lastY = -9999
    let energy = 0
    let glow = 0
    let running = false
    let frame = 0
    let previous = performance.now()
    let ratio = 1

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(window.innerWidth * ratio)
      canvas.height = Math.round(window.innerHeight * ratio)
    }
    resize()

    const spawn = (px: number, py: number, vx: number, vy: number, power: number) => {
      const particle = particles[particleIndex]
      particleIndex = (particleIndex + 1) % particles.length
      const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 2.6
      const speed = 0.05 + Math.random() * 0.25 * (0.5 + power)
      particle.x = px
      particle.y = py
      particle.vx = Math.cos(angle) * speed + vx * 0.02
      particle.vy = Math.sin(angle) * speed + vy * 0.02
      particle.max = particle.life = 250 + Math.random() * 400
      particle.size = 0.6 + Math.random() * 1.6
      particle.hot = Math.random() < 0.15
    }
    const spawnBolt = (px: number, py: number, power: number, bright: boolean) => {
      const item = bolts[boltIndex]
      boltIndex = (boltIndex + 1) % bolts.length
      bolt(px, py, Math.random() * Math.PI * 2, (10 + Math.random() * 28) * (bright ? 1.8 : 1) * (0.6 + power * 0.6), item.pts)
      item.max = item.life = bright ? 160 : 70 + Math.random() * 80
      item.width = bright ? 1.6 : 0.6 + Math.random() * 0.8
      item.bright = bright
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x = event.clientX
      y = event.clientY
      if (lastX < -999) {
        lastX = x
        lastY = y
      }
      const dx = x - lastX
      const dy = y - lastY
      const distance = Math.hypot(dx, dy)
      energy = Math.min(1.5, energy * 0.6 + distance / 40)
      const now = performance.now()
      trail.push({ x, y, t: now })
      if (trail.length > 14) trail.shift()
      const count = Math.min(8, Math.floor(distance / 6) + (Math.random() < 0.4 ? 1 : 0))
      for (let i = 0; i < count; i++) spawn(lastX + dx * Math.random(), lastY + dy * Math.random(), dx, dy, energy)
      if (Math.random() < 0.15 + energy * 0.4) spawnBolt(x, y, energy, false)
      if (distance > 45 && Math.random() < 0.25) spawnBolt(x, y, energy, true)
      glow = Math.min(1, glow + distance / 120)
      lastX = x
      lastY = y
      if (!running) {
        running = true
        previous = now
        frame = requestAnimationFrame(draw)
      }
    }
    const draw = (now: number) => {
      const dt = Math.min(48, now - previous)
      previous = now
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      context.globalCompositeOperation = 'lighter'
      let busy = false
      glow *= 0.992 ** dt
      if (glow > 0.02) {
        busy = true
        const gradient = context.createRadialGradient(x, y, 0, x, y, 70)
        gradient.addColorStop(0, `rgba(255,0,30,${0.14 * glow})`)
        gradient.addColorStop(1, 'rgba(255,0,30,0)')
        context.fillStyle = gradient
        context.fillRect(x - 70, y - 70, 140, 140)
      }
      while (trail.length && now - trail[0].t > 220) trail.shift()
      if (trail.length > 1) {
        busy = true
        context.lineCap = 'round'
        for (let i = 1; i < trail.length; i++) {
          const alpha = 1 - (now - trail[i].t) / 220
          context.strokeStyle = `rgba(160,0,18,${alpha * 0.6})`
          context.lineWidth = 3 * alpha
          context.beginPath()
          context.moveTo(trail[i - 1].x, trail[i - 1].y)
          context.lineTo(trail[i].x, trail[i].y)
          context.stroke()
          context.strokeStyle = `rgba(255,32,32,${alpha * 0.5})`
          context.lineWidth = 0.8 * alpha
          context.stroke()
        }
      }
      for (const item of bolts) {
        if (item.life <= 0) continue
        item.life -= dt
        busy = true
        const alpha = Math.max(0, item.life / item.max) * (Math.random() < 0.25 ? 0.4 : 1)
        context.beginPath()
        context.moveTo(item.pts[0], item.pts[1])
        for (let i = 2; i < item.pts.length; i += 2) context.lineTo(item.pts[i], item.pts[i + 1])
        context.shadowBlur = item.bright ? 14 : 8
        context.shadowColor = 'rgba(255,0,30,0.35)'
        context.strokeStyle = `rgba(255,32,32,${alpha * 0.85})`
        context.lineWidth = item.width * 2
        context.stroke()
        context.shadowBlur = 0
        context.strokeStyle = `rgba(255,255,255,${alpha * (item.bright ? 0.8 : 0.45)})`
        context.lineWidth = item.width * 0.5
        context.stroke()
      }
      for (const particle of particles) {
        if (particle.life <= 0) continue
        particle.life -= dt
        busy = true
        const alpha = Math.max(0, particle.life / particle.max)
        const fromX = particle.x
        const fromY = particle.y
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt
        particle.vx *= 0.985
        particle.vy *= 0.985
        context.strokeStyle = `rgba(${particle.hot ? '255,255,255' : '255,32,32'},${alpha * 0.9})`
        context.lineWidth = particle.size * alpha
        context.beginPath()
        context.moveTo(fromX - particle.vx * 18, fromY - particle.vy * 18)
        context.lineTo(particle.x, particle.y)
        context.stroke()
      }
      energy *= 0.95 ** (dt / 16)
      if (busy) frame = requestAnimationFrame(draw)
      else {
        running = false
        context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} className="spark-cursor" aria-hidden="true" />
}
