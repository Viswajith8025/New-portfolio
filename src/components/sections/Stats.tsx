import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stats } from '../../data/site'

gsap.registerPlugin(ScrollTrigger)

export function Stats() {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const figures = panel.querySelectorAll<HTMLElement>('[data-stat]')
    const counters = panel.querySelectorAll<HTMLElement>('[data-count]')
    const bars = panel.querySelectorAll<HTMLElement>('[data-bar]')
    const labels = panel.querySelectorAll<HTMLElement>('[data-label]')
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: panel, start: 'top 75%', toggleActions: 'play reverse play reverse' },
    })
    timeline.fromTo(panel, { y: 20, opacity: 0, scale: 0.97, filter: 'blur(12px)' }, { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' })
    figures.forEach((figure, index) => {
      const at = 0.3 + index * 0.18
      timeline.fromTo(figure, { y: 28 }, { y: 0, duration: 0.8, ease: 'power3.out' }, at)
      const counter = counters[index]
      const value = Number(counter.dataset.count)
      const state = { value: 0 }
      timeline.to(state, {
        value,
        duration: 2.2,
        ease: 'power3.out',
        onUpdate: () => {
          counter.textContent = String(Math.round(state.value))
        },
      }, at)
      timeline.fromTo(bars[index], { scaleX: 0 }, { scaleX: 1, duration: 2.2, ease: 'power3.out' }, at)
      timeline.fromTo(labels[index], { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, at + 0.25)
    })

    const target = { x: 50, y: 0 }
    const current = { x: 50, y: 0, opacity: 0.35 }
    const fine = window.matchMedia('(hover: hover)').matches
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const dt = 1 / 60
      current.x += (target.x - current.x) * (1 - Math.exp(-9 * dt))
      current.y += (target.y - current.y) * (1 - Math.exp(-9 * dt))
      const next = fine ? (panel.matches(':hover') ? 1 : 0.35) : 0.75
      current.opacity += (next - current.opacity) * (1 - Math.exp(-5.5 * dt))
      panel.style.setProperty('--mx', `${current.x}%`)
      panel.style.setProperty('--my', `${current.y}%`)
      panel.style.setProperty('--lo', String(current.opacity))
    }
    const onMove = (event: PointerEvent) => {
      const bounds = panel.getBoundingClientRect()
      target.x = ((event.clientX - bounds.left) / bounds.width) * 100
      target.y = ((event.clientY - bounds.top) / bounds.height) * 100
    }
    panel.addEventListener('pointermove', onMove)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      panel.removeEventListener('pointermove', onMove)
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  }, [])

  return (
    <section id="stats" className="border-t border-white/5 px-5 py-20 md:px-10 md:py-28 lg:px-16">
      <div ref={panelRef} className="stat-panel glass glass-panel-card relative mx-auto max-w-7xl overflow-hidden rounded-3xl">
        <div className="stat-light" />
        <div className="stat-rim" />
        <div className="relative grid grid-cols-3 divide-x divide-white/20">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-cq flex flex-col items-center px-3 py-8 text-center md:items-start md:px-8 md:py-20 md:text-left lg:px-10">
              <div className="flex w-full flex-col-reverse">
                <p data-label className="text-[10px] font-semibold tracking-[0.16em] text-gray-300 uppercase md:text-base">{stat.label}</p>
                <div data-bar className="mt-3 h-1 w-8 origin-left rounded-full bg-[#a31515] md:mt-6 md:w-12" />
                <div data-stat className="stat-fig">
                  <span data-count={stat.value}>0</span>
                  {stat.suffix ? <span className="stat-suffix">{stat.suffix}</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
