import { useEffect, useRef } from 'react'

export function Starfield() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    let cancel = false
    let stop = () => {}
    void import('../../three/starfield').then(({ mountStarfield }) => {
      if (cancel) return
      stop = mountStarfield(host)
    })
    return () => {
      cancel = true
      stop()
    }
  }, [])
  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#050507]" />
}
