import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { mountVenom, type VenomHandle } from '../webgl/venomButton'

type VenomButtonProps = {
  children: string
  href?: string
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
}

export function VenomButton({ children, href, type = 'button', className, disabled }: VenomButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleRef = useRef<VenomHandle | null>(null)
  const labelRef = useRef(children)
  const [webgl, setWebgl] = useState(true)
  const width = Math.max(180, children.length * 11 + 64)
  const plain = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    labelRef.current = children
    handleRef.current?.setLabel(children)
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || disabled || plain) return
    const handle = mountVenom(canvas, labelRef.current)
    if (!handle) {
      setWebgl(false)
      return
    }
    handleRef.current = handle
    return () => {
      handle.stop()
      handleRef.current = null
    }
  }, [disabled, plain])

  const classNames = cn(
    'relative inline-flex items-center justify-center rounded-full px-8 text-xs font-bold tracking-wider text-white uppercase md:text-sm',
    plain
      ? 'border border-white/10 bg-[#0b0b0e] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_1px_#ff1e3855,0_0_24px_-6px_#ff1e38aa]'
      : webgl
        ? 'overflow-visible bg-[#0b0b0e]'
        : 'glass-red overflow-visible',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1238]',
    className,
  )
  const style = { minWidth: `min(100%, ${width}px)`, maxWidth: '100%', height: 60 }
  const label = <span className="relative z-10 px-2">{children}</span>
  const canvas =
    webgl && !plain ? (
      <span className="pointer-events-none absolute -inset-40 overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2" />
      </span>
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
