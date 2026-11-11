import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { projects, type Project } from '../data/site'

type ProjectModalProps = {
  index: number | null
  onClose: () => void
  onIndex: (index: number) => void
}

export function ProjectModal({ index, onClose, onIndex }: ProjectModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const project: Project | undefined = index === null ? undefined : projects[index]
  const [posterFrame, setPosterFrame] = useState<{ src: string; portrait: boolean } | null>(null)
  const portraitPoster = posterFrame?.src === project?.poster && posterFrame.portrait

  useEffect(() => {
    if (index === null) return
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a, button, iframe, [tabindex]:not([tabindex="-1"])') ?? []).filter((node) => !node.hasAttribute('disabled'))
    const frame = window.setTimeout(() => focusables()[0]?.focus(), 30)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onIndex((index + 1) % projects.length)
      if (event.key === 'ArrowLeft') onIndex((index - 1 + projects.length) % projects.length)
      if (event.key === 'Tab') {
        const nodes = focusables()
        if (!nodes.length) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(frame)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
      trigger.current?.focus()
    }
  }, [index, onClose, onIndex])

  return (
    <AnimatePresence>
      {project && index !== null && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-2xl" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
            className="glass glass-strong relative z-10 max-h-[92dvh] w-full max-w-4xl overflow-auto rounded-3xl border-[#ff334b]/35 shadow-2xl shadow-red-950/50"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 p-5 md:p-7">
              <div>
                <span className="glass-chip-red inline-flex rounded-full px-3 py-1 text-[10px] font-black tracking-wider text-white uppercase">{project.category}</span>
                <h3 id="project-title" className="mt-3 text-2xl font-black text-white md:text-4xl">{project.title}</h3>
              </div>
              <div className="flex gap-2">
                <button type="button" aria-label="Previous project" className="glass-chip rounded-full p-2" onClick={() => onIndex((index - 1 + projects.length) % projects.length)}>
                  <ChevronLeft size={18} />
                </button>
                <button type="button" aria-label="Next project" className="glass-chip rounded-full p-2" onClick={() => onIndex((index + 1) % projects.length)}>
                  <ChevronRight size={18} />
                </button>
                <button type="button" aria-label="Close project" className="glass-chip rounded-full p-2" onClick={onClose}>
                  <X size={18} />
                </button>
              </div>
            </header>
            <div className="px-5 md:px-7">
              <div className={`overflow-hidden rounded-2xl bg-black ${portraitPoster ? 'mx-auto aspect-[9/16] max-w-xs' : 'aspect-video'}`}>
                <img
                  src={project.poster}
                  alt=""
                  className="h-full w-full object-contain"
                  onLoad={(event) => {
                    const img = event.currentTarget
                    setPosterFrame({ src: project.poster, portrait: img.naturalHeight > img.naturalWidth })
                  }}
                />
              </div>
            </div>
            <footer className="space-y-4 p-5 md:p-7">
              <p className="text-base text-gray-300 md:text-lg">{project.description}</p>
              <ul className="space-y-2">
                {project.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-400">{feature}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="glass-chip rounded-full px-3 py-1 text-xs font-bold text-gray-200">{tag}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="glass-chip rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase">Live demo ↗</a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noreferrer" className="glass-chip rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase">GitHub ↗</a>
                )}
                <a href="#contact" onClick={onClose} className="glass-red rounded-full px-4 py-2 text-xs font-bold tracking-wider text-white uppercase">Hire me for this</a>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
