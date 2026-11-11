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
    if (!webgl) return
    const section = sectionRef.current
    const host = hostRef.current
    const copy = copyRef.current
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
    }
  }, [webgl])

  return (
    <div id="hero" className="flex w-full flex-col overflow-hidden">
      <section ref={sectionRef} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden" style={{ touchAction: 'pan-y' }}>
        {webgl === false && (
          <div className="shadow-glass absolute overflow-hidden rounded-[28px] border border-white/10 max-md:top-[max(8.5%,84px)] max-md:right-[clamp(16px,5%,22px)] max-md:left-[clamp(16px,5%,22px)] max-md:h-1/2 md:inset-x-[5.5%] md:top-[max(8.5%,96px)] md:bottom-[8.5%]">
            <img src={profile.hero} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/80 via-[#050507]/30 to-transparent" />
          </div>
        )}
        <div ref={hostRef} className="absolute inset-0 touch-pan-y" aria-hidden="true" />
        <div
          ref={copyRef}
          data-hero={profile.hero}
          className="pointer-events-none absolute flex items-center will-change-transform max-md:items-end [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
          style={webgl === false ? undefined : { transformOrigin: '50% 50%', inset: '0' }}
        >
          <div className="w-full max-w-full pr-4 pl-4 max-md:rounded-3xl max-md:bg-gradient-to-t max-md:from-[#050507]/90 max-md:via-[#050507]/55 max-md:to-transparent max-md:pt-4 max-md:pb-2 md:max-w-[min(26rem,48%)] md:pr-4 md:pl-[6%] lg:max-w-[min(40rem,52%)] xl:max-w-[min(44rem,56%)]">
            <div data-hero-copy className="flex flex-col gap-2 sm:gap-3.5">
              <span className="text-[11px] font-bold tracking-[0.18em] text-[#ff2a3b] uppercase sm:text-xs sm:tracking-[0.25em] md:text-sm">{profile.eyebrow}</span>
              <h1 className="text-[clamp(1.85rem,5.6vw,6.75rem)] leading-[0.88] font-black tracking-tight whitespace-nowrap text-white uppercase drop-shadow-md">
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
