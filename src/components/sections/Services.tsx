import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { services } from '../../data/site'
import { useReveal } from '../../hooks/useReveal'

function Mark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="2" fill="#a31515" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M13 3l-1.4 1.4M4.4 11.6 3 13" stroke="#a31515" strokeWidth="1" />
    </svg>
  )
}

export function Services() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, '[data-reveal]')
  return (
    <section id="services" ref={ref} className="border-t border-white/5 px-5 py-20 md:px-12 md:py-28 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <p data-reveal className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#a31515] uppercase md:text-xs">
            <Mark /> What I Build
          </p>
          <h2 data-reveal className="mt-3 text-3xl font-black tracking-tight text-white uppercase md:text-5xl">Services.</h2>
          <div data-reveal className="mt-2 h-1 w-12 rounded-full bg-[#a31515]" />
        </div>
        <ul className="grid-blur mt-10 grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-4">
          {services.map((service, index) => (
            <li key={service.id} data-reveal className="service-item">
              <a href="#contact" className="glass glass-grid-card group relative flex h-full flex-col items-start gap-3 rounded-3xl p-4 md:flex-row md:items-center md:gap-6 md:p-5">
                <span className="glass-chip flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-gray-200 tabular-nums md:h-11 md:w-11 md:text-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-tight font-bold break-words text-white group-hover:text-[#ff334b] md:text-xl">{service.title}</span>
                <span className="mt-auto flex items-center gap-3 md:mt-0 md:ml-auto">
                  <span className="hidden text-right md:block">
                    <span className="block text-[10px] tracking-widest text-gray-500 uppercase">{service.priceLabel}</span>
                    <span className="glass-chip mt-1 inline-block rounded-full px-3 py-1 text-xs font-black text-gray-100">{service.price}</span>
                  </span>
                  <span className="glass-chip absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-[linear-gradient(145deg,rgba(255,51,75,.6),rgba(163,21,21,.45))] group-hover:text-white md:static md:h-11 md:w-11">
                    <ArrowUpRight size={16} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p data-reveal className="mt-6 text-[11px] text-gray-500 md:text-xs">Freelance and contract. Scope and timeline are agreed per project.</p>
      </div>
    </section>
  )
}
