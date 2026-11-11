import { useRef } from 'react'
import { about, education, experience } from '../../data/site'
import { useReveal } from '../../hooks/useReveal'
import { HangingFrame } from './HangingFrame'

export function About() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, '[data-reveal]')
  return (
    <section id="about" ref={ref} className="min-h-screen border-t border-white/5 px-5 py-24 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p data-reveal className="text-sm font-bold tracking-[0.2em] text-[#a31515] uppercase md:text-base">{about.eyebrow}</p>
          <h2 data-reveal className="mt-3 text-5xl font-black tracking-tight text-white uppercase sm:text-6xl md:text-8xl">{about.title}</h2>
          <div data-reveal className="mt-3 h-1.5 w-24 rounded-full bg-[#a31515]" />
          <div className="relative mt-8">
            <div className="red-halo" />
            <div data-reveal className="glass glass-panel-card relative rounded-3xl p-5 md:p-12">
              <div className="space-y-4 text-base leading-relaxed text-gray-300 md:text-2xl">
                {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <h3 className="mt-8 text-xs font-bold tracking-[0.2em] text-gray-500 uppercase md:text-base">Core Toolkit & Proficiencies</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {about.toolkit.map((item) => (
                  <span key={item} className="tech-pill glass-chip rounded-full px-3.5 py-1.5 text-xs font-bold md:px-5 md:py-2.5 md:text-lg">{item}</span>
                ))}
              </div>
              <div className="mt-8 space-y-4">
                {experience.map((item) => (
                  <div key={item.org}>
                    <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">{item.org}</p>
                    <p className="mt-1 font-black text-white">{item.role}</p>
                    <p className="text-xs font-bold text-[#ff334b]">{item.dates}</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-300">
                      {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {education.map((item) => (
                  <div key={item.title}>
                    <p className="font-black text-white">{item.title}</p>
                    <p className="mt-1 text-[10px] font-bold tracking-widest text-[#ff334b] uppercase">{item.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div data-reveal className="lg:col-span-5">
          <HangingFrame />
        </div>
      </div>
    </section>
  )
}
