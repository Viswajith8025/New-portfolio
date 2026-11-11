import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'

export function useReveal(ref: RefObject<HTMLElement | null>, selector: string) {
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let stop = () => {}

    const setup = () => {
      stop()
      if (motion.matches) return
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector))
      if (!nodes.length) return
      const context = gsap.context(() => {
        gsap.set(nodes, { opacity: 0, y: 20, filter: 'blur(12px)' })
      }, root)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const node = entry.target as HTMLElement
            const visible = entry.isIntersecting
            if (node.dataset.revealVisible === String(visible)) return
            node.dataset.revealVisible = String(visible)
            const index = nodes.indexOf(node)
            gsap.to(node, {
              opacity: visible ? 1 : 0,
              y: visible ? 0 : 20,
              filter: visible ? 'blur(0px)' : 'blur(12px)',
              duration: visible ? 0.8 : 0.65,
              delay: visible ? Math.min((index % 5) * 0.055, 0.22) : 0,
              ease: 'power3.out',
              overwrite: 'auto',
            })
          })
        },
        { threshold: 0, rootMargin: '-4% 0px -4% 0px' },
      )
      nodes.forEach((node) => observer.observe(node))
      stop = () => {
        observer.disconnect()
        gsap.killTweensOf(nodes)
        context.revert()
        nodes.forEach((node) => {
          delete node.dataset.revealVisible
        })
      }
    }

    setup()
    motion.addEventListener('change', setup)
    return () => {
      stop()
      motion.removeEventListener('change', setup)
    }
  }, [ref, selector])
}
