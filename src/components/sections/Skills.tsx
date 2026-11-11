import { useRef } from 'react'
import { aiWorkflow, skills } from '../../data/site'
import { useReveal } from '../../hooks/useReveal'
import { Arsenal } from './Arsenal'

export function Skills() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, '[data-reveal]')
  return (
    <section id="skills" ref={ref} className="border-t border-white/5 px-5 py-20 md:px-12 md:py-28 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <p data-reveal className="text-sm font-bold tracking-[0.2em] text-[#a31515] uppercase md:text-base">Arsenal & Expertise</p>
          <h2 data-reveal className="mt-3 text-5xl font-black tracking-tight text-white uppercase md:text-7xl">Technical Skills.</h2>
          <div data-reveal className="mt-3 h-1.5 w-20 rounded-full bg-[#a31515]" />
        </div>
        <ul className="grid-blur mt-12 grid grid-cols-2 gap-3 md:gap-7">
          {skills.map((skill) => (
            <li key={skill.name} data-reveal className="glass glass-grid-card flex min-w-0 flex-col gap-4 rounded-3xl p-4 md:flex-row md:items-center md:p-8">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white hover:text-[#a31515] md:text-2xl">{skill.name}</h3>
                <p className="mt-1 text-[10px] tracking-[0.16em] text-gray-500 uppercase md:text-sm">{skill.category}</p>
              </div>
              <span className="glass-chip w-fit rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase md:text-xs">{skill.level}</span>
            </li>
          ))}
        </ul>
        <div data-reveal>
          <Arsenal />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {aiWorkflow.map((tool) => (
              <span key={tool} className="glass-chip rounded-full px-5 py-2.5 text-[11px] font-bold tracking-widest text-white/70 uppercase">{tool}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
