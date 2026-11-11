import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile } from '../../data/site'

const WORDS = profile.loaderLine.split(' ')
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const ONES = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

type GlitchLoaderProps = { onComplete: () => void }

export function GlitchLoader({ onComplete }: GlitchLoaderProps) {
  const [value, setValue] = useState(0)
  const [revealing, setRevealing] = useState(false)
  const done = useRef(onComplete)

  useEffect(() => {
    done.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    let frame = 0
    let display = 0
    let target = 0
    let images = 0
    let fonts = 0
    let loaded = document.readyState === 'complete' ? 1 : 0
    let scene = 0
    const started = performance.now()
    const sources = [profile.portrait, profile.hero, profile.hero, '/favicon.png']
    sources.forEach((src) => {
      const image = new Image()
      const finish = () => {
        images += 1 / sources.length
      }
      image.onload = finish
      image.onerror = finish
      image.src = src
    })
    void document.fonts.ready.then(() => {
      fonts = 1
    })
    const onLoad = () => {
      loaded = 1
    }
    window.addEventListener('load', onLoad)
    let last = performance.now()
    let finished = false
    const tick = (now: number) => {
      const elapsed = now - started
      if (document.querySelector('[data-scene-ready]')) scene = 1
      else if (elapsed > 6000) scene = 1
      target = Math.min(1, images * 0.45 + fonts * 0.2 + loaded * 0.15 + scene * 0.2)
      target = Math.min(target, elapsed / 2000)
      if (elapsed > 7000 || (reduced && elapsed >= 2000)) target = 1
      const dt = now - last
      last = now
      display = Math.min(target, display + Math.max(reduced ? 0.08 : 0.0015, (target - display) * 0.006 * dt))
      setValue(display)
      if (display >= 0.995 && !finished) {
        finished = true
        window.setTimeout(() => setRevealing(true), reduced ? 40 : 500)
        window.setTimeout(() => {
          document.body.style.overflow = previous
          done.current()
          window.setTimeout(() => ScrollTrigger.refresh(), 100)
        }, reduced ? 280 : 1500)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('load', onLoad)
      document.body.style.overflow = previous
    }
  }, [])

  const shown = Math.min(100, Math.round(value * 100))
  const tens = Math.min(9, Math.floor(shown / 10))
  const ones = shown % 10
  const fraction = Math.min(1, value)

  return (
    <div className={`glitch-loader ${revealing ? 'is-revealing' : ''}`} role="status" aria-live="polite" aria-label="Loading">
      <div className="glitch-loader__veil" />
      <div className="glitch-loader__count" aria-hidden="true">
        {shown >= 100 ? (
          <span className="glitch-loader__final">100</span>
        ) : (
          <>
            <span className="glitch-loader__digit">
              <span className="glitch-loader__digit-strip" style={{ transform: `translateY(-${tens}em)` }}>
                {DIGITS.map((digit) => <span key={digit}>{digit}</span>)}
              </span>
            </span>
            <span className="glitch-loader__digit">
              <span className="glitch-loader__digit-strip" style={{ transform: `translateY(-${9 - ones}em)` }}>
                {ONES.map((digit) => <span key={digit}>{digit}</span>)}
              </span>
            </span>
          </>
        )}
      </div>
      <div className="glitch-loader__center">
        <p className="glitch-loader__statement" style={{ filter: `blur(${(1 - fraction) * 6}px)` }}>
          {WORDS.map((word, index) => (
            <span key={word} className="glitch-loader__word" style={{ opacity: Math.max(0, Math.min(1, (fraction - (index / WORDS.length) * 0.7) * 3)) }}>
              {word}
            </span>
          ))}
        </p>
        {[0, 1, 2, 3, 4].map((band) => (
          <p key={band} className={`glitch-loader__frag glitch-loader__frag--${band}`} aria-hidden="true">
            {profile.loaderLine}
          </p>
        ))}
      </div>
    </div>
  )
}
