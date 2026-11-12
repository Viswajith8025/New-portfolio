import { useEffect, useRef, useState } from 'react'
import { profile } from '../../data/site'
import { useReveal } from '../../hooks/useReveal'
import { VenomButton } from '../VenomButton'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
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
    if (!webgl) {
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
  }, [webgl])

  return (
    <div id="hero" className="flex w-full flex-col overflow-hidden">
      <section ref={sectionRef} className="relative flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden" style={{ touchAction: 'pan-y' }}>
        {webgl === false && (
          <div className="shadow-glass absolute inset-x-[clamp(16px,5%,22px)] top-[max(8.5%,84px)] h-1/2 overflow-hidden rounded-[28px] border border-white/10 md:inset-x-[5.5%] md:top-[max(8.5%,96px)] md:bottom-[8.5%] md:h-auto">
            <img src={profile.hero} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/80 via-[#050507]/30 to-transparent" />
          </div>
        )}
        <div ref={hostRef} className="absolute inset-0 touch-pan-y" aria-hidden="true" />
        <div
          ref={copyRef}
          data-hero={profile.hero}
          className={
            webgl === false
              ? 'pointer-events-none relative flex w-full items-center px-4 pt-6 pb-8 [&_a]:pointer-events-auto [&_button]:pointer-events-auto md:absolute md:inset-0 md:px-0 md:pt-0 md:pb-0'
              : 'pointer-events-none absolute inset-0 flex w-full items-start will-change-transform [&_a]:pointer-events-auto [&_button]:pointer-events-auto md:items-center'
          }
          style={webgl === false ? undefined : { transformOrigin: '50% 50%' }}
        >
          <div className="w-full max-w-full md:max-w-[min(26rem,48%)] md:pr-4 md:pl-[6%] lg:max-w-[min(40rem,52%)] xl:max-w-[min(44rem,56%)]">
            <div data-hero-copy className="flex flex-col gap-2 sm:gap-3.5">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#ff2a3b] uppercase sm:text-xs md:text-sm">{profile.eyebrow}</span>
              <h1 className="text-4xl leading-[0.88] font-black tracking-tight whitespace-nowrap text-white uppercase drop-shadow-md sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                {profile.short}
              </h1>
              <div className="mt-0.5 flex items-center gap-2 text-sm font-extrabold tracking-wider text-white uppercase sm:gap-3 sm:text-base md:text-lg lg:text-xl">
                <span>Full Stack Developer</span>
              </div>
              <p className="mt-1 max-w-prose text-xs font-normal tracking-wide text-gray-300 sm:text-sm md:text-base lg:text-lg">{profile.tagline}</p>
              <div className="mt-3 flex flex-col items-start gap-3 md:mt-6 md:flex-row md:flex-wrap md:items-center md:gap-4">
                <VenomButton href="#projects">EXPLORE MY WORK</VenomButton>
                <a href="#contact" className="glass glass-hover inline-flex items-center justify-center rounded-full px-5 py-3 text-xs font-bold tracking-wider text-gray-200 uppercase transition-all duration-300 hover:-translate-y-0.5 hover:text-white md:px-7 md:py-3.5 md:text-sm">
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
