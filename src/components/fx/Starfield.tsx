import { useEffect, useRef } from 'react'
import { mountStarfield } from '../../three/starfield'

export function Starfield() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    return mountStarfield(host)
  }, [])
  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#050507]" />
}
