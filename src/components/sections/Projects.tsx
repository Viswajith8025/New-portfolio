import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { profile, projects } from '../../data/site'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useReveal } from '../../hooks/useReveal'
import { Button } from '../ui/button'
import { ProjectVideoCard } from './ProjectVideoCard'

const featuredProjects = projects.filter((project) => project.featured)

type ProjectsProps = { onSelect: (index: number) => void }

export function Projects({ onSelect }: ProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [fallback, setFallback] = useState(false)
  useReveal(sectionRef, '[data-project-heading] > *, [data-project-fallback]')

  useEffect(() => {
    if (reduced) return
    const section = sectionRef.current
    const stage = stageRef.current
    const tooltip = tooltipRef.current
    if (!section || !stage || !tooltip) return
    let cancel = false
    let stop = () => {}
    void import('../../three/projectsRail').then(({ mountProjectsRail }) => {
      if (cancel) return
      const mounted = mountProjectsRail(section, stage, tooltip, featuredProjects, (railIndex) => {
        const id = featuredProjects[railIndex]?.id
        const full = projects.findIndex((project) => project.id === id)
        if (full >= 0) onSelect(full)
      })
      if (!mounted) setFallback(true)
      else stop = mounted
    })
    return () => {
      cancel = true
      stop()
    }
  }, [onSelect, reduced])

  const grid = reduced || fallback

  return (
    <section id="projects" ref={sectionRef} className={`relative border-t border-white/5 ${grid ? 'px-5 py-28 md:px-12 lg:px-20' : 'h-[420vh]'}`}>
      <div className={grid ? '' : 'sticky top-0 h-screen overflow-hidden'}>
        <div ref={stageRef} className={grid ? '' : 'absolute inset-0 z-10'} data-no-ripple>
          <div data-project-heading className={grid ? 'mx-auto mb-14 max-w-7xl text-center' : 'pointer-events-none absolute top-24 right-0 left-0 z-20 px-5 text-center'}>
            <p className="text-sm font-bold tracking-[0.2em] text-[#a31515] uppercase md:text-base">Featured Works</p>
            <h2 className="mt-3 text-5xl leading-none font-black tracking-tight text-white uppercase md:text-7xl">Projects.</h2>
            <div className="mx-auto mt-3 h-1.5 w-20 rounded-full bg-[#a31515]" />
            <a href={profile.github} target="_blank" rel="noreferrer" className="glass glass-hover pointer-events-auto mt-6 inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-bold text-gray-200 hover:-translate-y-0.5 hover:text-white md:text-base">
              <ArrowUpRight className="text-[#a31515]" size={18} />
              View all on GitHub
              <span className="text-[#ff334b] transition-transform group-hover:translate-x-px">↗</span>
            </a>
          </div>
          {!grid && (
            <div ref={tooltipRef} className="glass pointer-events-none absolute top-0 left-0 z-30 max-w-64 rounded-xl px-4 py-3 opacity-0">
              <p data-c className="text-[10px] tracking-[.2em] text-red-400 uppercase" />
              <p data-t className="font-black text-white" />
              <p data-s className="text-xs text-gray-400" />
            </div>
          )}
        </div>
        <ul className="sr-only">
          {projects.map((project, index) => (
            <li key={project.id}>
              <button type="button" onClick={() => onSelect(index)}>
                Open {project.title}
              </button>
            </li>
          ))}
        </ul>
        {grid && (
          <div data-project-fallback>
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {featuredProjects.map((project) => {
                const index = projects.findIndex((item) => item.id === project.id)
                return (
                  <Button key={project.id} variant="ghost" className="glass glass-panel-card h-auto flex-col items-stretch overflow-hidden rounded-2xl p-0 text-left whitespace-normal" onClick={() => onSelect(index)}>
                    <ProjectVideoCard project={project} />
                    <div className="space-y-2 p-3 sm:p-5">
                      <p className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">{project.category}</p>
                      <h3 className="text-base font-black text-white sm:text-xl">{project.title}</h3>
                      <p className="text-xs text-gray-400 sm:text-sm">{project.subtitle}</p>
                    </div>
                  </Button>
                )
              })}
            </div>
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => onSelect(0)} className="glass glass-hover inline-flex items-center rounded-full px-6 py-3 text-sm font-bold text-gray-200 hover:-translate-y-0.5 hover:text-white">
                View all projects
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
