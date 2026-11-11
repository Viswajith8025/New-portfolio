import { useEffect, useState } from 'react'
import { navLinks, profile } from '../data/site'

export function Navbar() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 z-50 w-full px-3 pt-3 md:px-6">
      <nav className={`glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-5 transition-all duration-300 md:px-8 ${compact ? 'bg-[#111113]/80! py-2.5' : 'py-3.5'}`}>
        <a href="#hero" className="text-2xl font-black tracking-tight uppercase">
          <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">V</span>
          <span className="transition-colors duration-300 hover:text-red-500">{profile.logoRest}</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="group relative text-xs font-bold tracking-[0.15em] text-gray-400 uppercase hover:text-white md:text-sm">
              {link.label}
              <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-red-600 shadow-[0_0_12px_#dc2626] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </div>
        <a href="#contact" className="glass-red hidden rounded-full px-5 py-2 text-xs font-bold tracking-wider uppercase sm:block">
          Let's Talk
        </a>
      </nav>
    </header>
  )
}
