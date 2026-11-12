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
    <header className="fixed top-0 left-0 z-50 w-full px-3 pt-3 md:px-4 lg:px-6">
      <nav className={`glass mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl px-3 transition-all duration-300 sm:gap-3 sm:px-4 lg:px-8 ${compact ? 'bg-[#111113]/80! py-2' : 'py-3'}`}>
        <a href="#hero" className="shrink-0 text-2xl font-black tracking-tight whitespace-nowrap uppercase">
          <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">V</span>
          <span className="transition-colors duration-300 hover:text-red-500">{profile.logoRest}</span>
        </a>
        <div className="hidden min-w-0 items-center justify-end gap-5 md:flex md:gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="group relative text-[10px] font-bold tracking-[0.12em] whitespace-nowrap text-gray-400 uppercase hover:text-white lg:text-xs xl:text-sm xl:tracking-[0.15em]">
              {link.label}
              <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-red-600 shadow-[0_0_12px_#dc2626] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </div>
        <a href="#contact" className="glass-red hidden shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase sm:block sm:px-4 sm:py-2 sm:text-xs">
          Let's Talk
        </a>
      </nav>
    </header>
  )
}
