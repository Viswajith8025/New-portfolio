import { useEffect, useRef, useState } from 'react'
import { profile } from '../../data/site'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReveal } from '../../hooks/useReveal'
import { VenomButton } from '../VenomButton'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const narrow = useMediaQuery('(max-width: 767px)')
  const [webgl] = useState<boolean | null>(() => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    const ok = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  })

  useReveal(sectionRef, '[data-hero-copy] > span, [data-hero-copy] > h1, [data-hero-copy] > div, [data-hero-copy] > p')

  useEffect(() => {
    const copy = copyRef.current
    const clearCopy = () => {
      if (!copy) return
      copy.style.left = ''
      copy.style.top = ''
      copy.style.width = ''
      copy.style.height = ''
      copy.style.transform = ''
      copy.style.opacity = ''
    }
    if (!webgl || narrow) {
      clearCopy()
      return
    }
    const section = sectionRef.current
    const host = hostRef.current
    if (!section || !host || !copy) return
    let cancel = false
    let stop = () => {}
    void import('../../three/heroShards').then(({ mountHeroShards }) => {
      if (cancel) return
      stop = mountHeroShards(section, host, copy)
    })
    return () => {
      cancel = true
      stop()
      clearCopy()
    }
  }, [narrow, webgl])

  return (
    <div id="hero" className="flex w-full flex-col overflow-hidden">
      <section ref={sectionRef} className="relative flex h-auto min-h-[100svh] w-full flex-col overflow-hidden md:h-[100svh] md:min-h-[640px] md:items-center" style={{ touchAction: 'pan-y' }}>
        <div className="relative mx-4 mt-24 h-[50svh] overflow-hidden rounded-[28px] border border-white/10 shadow-glass md:hidden">
          <img src="/hero/hero-mobile.webp" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <g fill="none" stroke="#d94a52" strokeOpacity="0.25" strokeWidth="0.7" vectorEffect="non-scaling-stroke">
              <path d="M22 0 L48 62" />
              <path d="M51.5 0 L71.6 49" />
              <path d="M84 0 L71.6 49" />
              <path d="M48 62 L38.5 72 L34 100" />
              <path d="M71.6 49 L86.5 100" />
            </g>
          </svg>
        </div>
        {webgl === false && (
          <div className="shadow-glass absolute inset-x-[5.5%] top-[max(8.5%,96px)] bottom-[8.5%] hidden overflow-hidden rounded-[28px] border border-white/10 md:block">
            <img src={profile.hero} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/80 via-[#050507]/30 to-transparent" />
          </div>
        )}
        <div ref={hostRef} className="absolute inset-0 hidden touch-pan-y md:block" aria-hidden="true" />
        <div
          ref={copyRef}
          data-hero={profile.hero}
          className="pointer-events-none relative flex w-full items-center will-change-transform [&_a]:pointer-events-auto [&_button]:pointer-events-auto md:absolute"
          style={webgl === false || narrow ? undefined : { transformOrigin: '50% 50%', inset: '0' }}
        >
          <div className="w-full max-w-full px-4 pt-6 pb-8 md:max-w-[min(26rem,48%)] md:pt-0 md:pb-0 md:pr-4 md:pl-[6%] lg:max-w-[min(40rem,52%)] xl:max-w-[min(44rem,56%)]">
            <div data-hero-copy className="flex flex-col gap-2 sm:gap-3.5">
              <span className="text-[11px] font-bold tracking-[0.18em] text-[#ff2a3b] uppercase sm:text-xs sm:tracking-[0.25em] md:text-sm">{profile.eyebrow}</span>
              <h1 className="text-4xl leading-[0.88] font-black tracking-tight whitespace-nowrap text-white uppercase drop-shadow-md sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                {profile.short}
              </h1>
              <div className="mt-0.5 flex items-center gap-2 text-sm font-extrabold tracking-wider text-white uppercase sm:gap-3 sm:text-base md:text-lg lg:text-xl">
                <span>Full Stack Developer</span>
              </div>
              <p className="mt-1 max-w-prose text-xs font-normal tracking-wide text-gray-300 sm:text-sm md:text-base lg:text-lg">{profile.tagline}</p>
              <div className="mt-3 flex flex-col items-stretch gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <VenomButton href="#projects" className="w-full sm:w-auto">EXPLORE MY WORK</VenomButton>
                <a href="#contact" className="glass glass-hover inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-xs font-bold tracking-wider text-gray-200 uppercase transition-all duration-300 hover:-translate-y-0.5 hover:text-white sm:w-auto sm:px-7 sm:py-3.5 sm:text-sm">
                  Get In Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
