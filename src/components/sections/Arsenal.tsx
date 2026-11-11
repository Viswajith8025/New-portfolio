import { siFastapi, siGit, siLangchain, siPython, siReact, siSupabase, siTypescript } from 'simple-icons'
import { arsenal } from '../../data/site'

const ICONS = {
  react: siReact,
  typescript: siTypescript,
  python: siPython,
  fastapi: siFastapi,
  supabase: siSupabase,
  langchain: siLangchain,
  git: siGit,
}

export function Arsenal() {
  return (
    <div className="mt-24">
      <p className="text-center text-sm font-bold tracking-[0.2em] text-[#a31515] uppercase md:text-base">Software & Tools</p>
      <h3 className="mt-3 text-center text-4xl font-black tracking-tight text-white uppercase md:text-6xl">My Arsenal.</h3>
      <ul className="grid-blur mt-10 flex flex-wrap justify-center gap-4 md:gap-6">
        {arsenal.map((item) => {
          const icon = ICONS[item.slug]
          return (
            <li key={item.slug} className="glass glass-grid-card group flex h-[190px] w-[132px] flex-col items-center justify-center gap-4 rounded-3xl md:h-[216px] md:w-[148px] xl:h-[224px] xl:w-[152px]">
              <span className="grid h-14 w-14 place-items-center rounded-[7px] md:h-16 md:w-16" style={{ boxShadow: `0 0 12px -4px #${icon.hex}80` }}>
                <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden="true">
                  <path d={icon.path} fill={`#${icon.hex}`} />
                </svg>
              </span>
              <span className="text-center text-xs whitespace-pre-line text-gray-400 group-hover:text-gray-100 md:text-sm">{item.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
