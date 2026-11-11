import { useEffect, useRef } from 'react'
import { profile } from '../../data/site'

export function HangingFrame() {
  const rigRef = useRef<HTMLDivElement>(null)
  const swingRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rig = rigRef.current
    const swing = swingRef.current
    if (!rig || !swing) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let angle = 0
    let velocity = 0
    let tilt = 0
    let target = 0
    let dragging = false
    let pointerId = -1
    let lastX = 0
    let lastTime = performance.now()
    let visible = true
    let frame = 0

    const nail = () => {
      const bounds = rig.getBoundingClientRect()
      return { x: bounds.left + bounds.width / 2, y: bounds.top + 8 }
    }
    const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value))
    const onMove = (event: PointerEvent) => {
      const now = performance.now()
      const dt = Math.max((now - lastTime) / 1000, 0.008)
      const speed = (event.clientX - lastX) / dt
      lastX = event.clientX
      lastTime = now
      if (dragging && event.pointerId === pointerId) {
        const origin = nail()
        target = clamp(Math.atan2(-(event.clientX - origin.x), Math.max(event.clientY - origin.y, 60)), 0.38)
        return
      }
      if (reduced || coarse || !visible) return
      const bounds = rig.getBoundingClientRect()
      const distance =
        Math.abs(event.clientX - (bounds.left + bounds.width / 2)) +
        Math.max(0, Math.abs(event.clientY - (bounds.top + bounds.height / 2)) - bounds.height / 2)
      const falloff = Math.max(0, 1 - distance / 900)
      velocity += clamp(-speed * 9e-4 * falloff, 0.25)
    }
    const onDown = (event: PointerEvent) => {
      dragging = true
      pointerId = event.pointerId
      swing.setPointerCapture?.(event.pointerId)
      swing.style.cursor = 'grabbing'
      lastX = event.clientX
    }
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      dragging = false
      pointerId = -1
      target = 0
      swing.style.cursor = ''
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
    }, { rootMargin: '200px' })
    observer.observe(rig)
    let previous = performance.now()
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min((now - previous) / 1000, 0.05)
      previous = now
      if (!visible && !dragging) return
      const spring = dragging ? 70 : 26
      const goal = dragging ? target : 0
      velocity += -spring * (angle - goal) * dt
      velocity *= Math.exp(-3.2 * dt)
      angle += velocity * dt
      if (Math.abs(angle) > 0.38) {
        angle = Math.sign(angle) * 0.38
        velocity *= -0.3
      }
      tilt += (velocity * 0.6 - tilt) * (1 - Math.exp(-6 * dt))
      const degrees = (angle * 180) / Math.PI
      swing.style.transform = `rotateZ(${degrees}deg) rotateY(${Math.max(-0.4, Math.min(0.4, tilt)) * 30}deg)`
      if (shadowRef.current) shadowRef.current.style.transform = `translateX(${-degrees * 2.2}px) rotateZ(${degrees * 0.8}deg)`
    }
    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove, { passive: true })
    swing.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      swing.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    <div ref={rigRef} className="hang-rig" data-no-ripple>
      <span className="hang-nail" aria-hidden="true" />
      <div ref={shadowRef} className="hang-shadow" aria-hidden="true" />
      <div ref={swingRef} className="hang-swing">
        <svg className="hang-strings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="50" y1="0" x2="12" y2="100" />
          <line x1="50" y1="0" x2="88" y2="100" />
        </svg>
        <div className="hang-frame">
          <span className="hang-ring hang-ring-l" aria-hidden="true" />
          <span className="hang-ring hang-ring-r" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/15">
            <img src={profile.portrait} alt={profile.name} draggable={false} className="h-full w-full object-cover grayscale transition-all duration-700 select-none hover:grayscale-0" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="font-black tracking-tight text-white uppercase">{profile.short}</p>
              <p className="text-sm text-red-400">{profile.frameRole}</p>
            </div>
          </div>
          <div className="hang-glare rounded-[18px]" />
        </div>
      </div>
    </div>
  )
}
