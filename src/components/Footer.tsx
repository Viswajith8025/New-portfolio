import { useRef } from 'react'
import { profile } from '../data/site'
import { useReveal } from '../hooks/useReveal'

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, 'footer > div > *')
  return (
    <footer ref={ref} className="glass-bar px-5 py-12 md:px-16">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
        <a href="#hero" className="text-2xl font-black tracking-tight uppercase">
          <span className="text-red-600">V</span>{profile.logoRest}
        </a>
        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">© {new Date().getFullYear()} Viswajith E. Full-Stack & AI Developer.</p>
        <div className="flex gap-5 text-xs font-bold tracking-widest text-gray-400 uppercase">
          <a href="#hero" className="hover:text-red-500">Top</a>
          <a href="#about" className="hover:text-red-500">About</a>
          <a href="#projects" className="hover:text-red-500">Projects</a>
          <a href="#contact" className="hover:text-red-500">Contact</a>
          <a href={profile.resume} target="_blank" rel="noreferrer" className="hover:text-red-500">Resume</a>
        </div>
      </div>
    </footer>
  )
}
