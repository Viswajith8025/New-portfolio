import { useCallback, useState } from 'react'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Hero } from './components/sections/Hero'
import { Projects } from './components/sections/Projects'
import { Services } from './components/sections/Services'
import { Skills } from './components/sections/Skills'
import { Stats } from './components/sections/Stats'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { ProjectModal } from './components/ProjectModal'
import { AmbientOrbs } from './components/fx/AmbientOrbs'
import { GlitchLoader } from './components/fx/GlitchLoader'
import { SparkCursor } from './components/fx/SparkCursor'
import { Starfield } from './components/fx/Starfield'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<number | null>(null)
  const close = useCallback(() => setActive(null), [])
  const finish = useCallback(() => setLoading(false), [])

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-[#07070a] font-sans text-gray-100 selection:bg-[#a31515] selection:text-white">
      <Starfield />
      <AmbientOrbs />
      <SparkCursor />
      {loading && <GlitchLoader onComplete={finish} />}
      <Navbar />
      <main className="relative z-10 w-full flex-1">
        <Hero />
        <Stats />
        <Projects onSelect={setActive} />
        <About />
        <Services />
        <Skills />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <ProjectModal index={active} onClose={close} onIndex={setActive} />
    </div>
  )
}
