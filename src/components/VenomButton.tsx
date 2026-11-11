import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { mountVenom } from '../webgl/venomButton'

type VenomButtonProps = {
  children: string
  href?: string
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
}

export function VenomButton({ children, href, type = 'button', className, disabled }: VenomButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webgl, setWebgl] = useState(true)
  const width = Math.max(180, children.length * 11 + 64)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || disabled) return
    const stop = mountVenom(canvas, children)
    if (!stop) {
      setWebgl(false)
      return
    }
    return stop
  }, [children, disabled])

  const classNames = cn(
    'glass-red relative inline-flex items-center justify-center rounded-full px-8 text-xs font-bold uppercase tracking-wider text-white md:text-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1238]',
    className,
  )
  const style = { minWidth: `min(100%, ${width}px)`, maxWidth: '100%', height: 56 }
  const label = <span className="relative z-10 px-2">{children}</span>
  const canvas = webgl ? (
    <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2" />
  ) : null

  if (href) {
    return (
      <a href={href} data-cursor="venom" className={classNames} style={style}>
        {canvas}
        {label}
      </a>
    )
  }
  return (
    <button type={type} data-cursor="venom" className={classNames} style={style} disabled={disabled}>
      {canvas}
      {label}
    </button>
  )
}
