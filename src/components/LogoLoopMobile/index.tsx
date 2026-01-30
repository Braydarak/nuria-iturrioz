import React, { useMemo, useEffect, useRef, useState } from 'react'

type LogoItem = string | React.ReactNode

type BitsLogoLoopProps = {
  logos: LogoItem[]
  speed?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  width?: number | string
  logoHeight?: number
  gap?: number
  hoverSpeed?: number | undefined
  fadeOut?: boolean
  fadeOutColor?: string
  scaleOnHover?: boolean
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}

const BitsLogoLoop = ({
  logos,
  speed = 10,
  direction = 'left',
  width = '100%',
  logoHeight = 28,
  gap = 32,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  ariaLabel = 'Partner logos',
  className = '',
  style,
}: BitsLogoLoopProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [duration, setDuration] = useState(10)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const updateDuration = () => {
      const containerWidth = el.clientWidth || 300
      const distancePx = containerWidth
      const s = Math.max(1, distancePx / Math.max(1, Math.abs(speed)))
      setDuration(s)
    }

    updateDuration()
    const ro = new ResizeObserver(updateDuration)
    ro.observe(el)
    return () => ro.disconnect()
  }, [speed])

  const handleMouseEnter = () => {
    if (hoverSpeed === 0) {
      setPaused(true)
    } else if (hoverSpeed && hoverSpeed > 0) {
      const el = rootRef.current
      if (el) {
        const containerWidth = el.clientWidth || 300
        const s = Math.max(1, containerWidth / Math.max(1, hoverSpeed))
        setDuration(s)
      }
    }
  }
  const handleMouseLeave = () => {
    setPaused(false)
    const el = rootRef.current
    if (el) {
      const containerWidth = el.clientWidth || 300
      const s = Math.max(1, containerWidth / Math.max(1, Math.abs(speed)))
      setDuration(s)
    }
  }

  const isHorizontal = direction === 'left' || direction === 'right'
  const isLeft = direction === 'left'

  // Duplicate the logos multiple times (even count) so the second half
  // matches the first half for a seamless 50% translate animation.
  const renderItems = useMemo(() => {
    const sets = 4
    const items: LogoItem[] = []
    for (let i = 0; i < sets; i++) items.push(...logos)
    return items
  }, [logos])

  return (
    <div
      ref={rootRef}
      aria-label={ariaLabel}
      className={`bits-logo-loop relative overflow-hidden ${fadeOut ? 'fade' : ''} ${className}`}
      style={{ width, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>
        {`
          .bits-logo-loop .row { will-change: transform; display: inline-flex; height: 100%; align-items: center; gap: ${gap}px; flex-wrap: nowrap; width: max-content; }
          .bits-logo-loop .item { height: ${logoHeight}px; width: auto; object-fit: contain; flex-shrink: 0; ${scaleOnHover ? 'transition: transform 200ms ease;' : ''} }
          .bits-logo-loop .item:hover { ${scaleOnHover ? 'transform: scale(1.05);' : ''} }
          .bits-logo-loop.fade::before { content: ''; position: absolute; inset: 0; pointer-events: none;
            ${fadeOut ? `background: linear-gradient(to ${isHorizontal ? 'right' : 'bottom'},
              ${fadeOutColor ?? 'rgba(42, 87, 158, 0.85)'} 0%,
              ${fadeOutColor ? 'transparent' : 'rgba(42, 87, 158, 0.00)'} 10%,
              ${fadeOutColor ? 'transparent' : 'rgba(42, 87, 158, 0.00)'} 90%,
              ${fadeOutColor ?? 'rgba(42, 87, 158, 0.85)'} 100%)` : ''}
          }

          @keyframes marqueeLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes marqueeRight { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
          @keyframes marqueeUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
          @keyframes marqueeDown { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
        `}
      </style>

      <div
        className="row"
        style={{
          animationName: isHorizontal ? (isLeft ? 'marqueeLeft' : 'marqueeRight') : direction === 'up' ? 'marqueeUp' : 'marqueeDown',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {renderItems.map((item, idx) => (
          typeof item === 'string' ? (
            <img
              key={`bits-${idx}`}
              src={item}
              alt={`Logo ${idx % logos.length + 1}`}
              className="item"
              aria-hidden={idx >= logos.length}
              style={{ filter: 'grayscale(1) brightness(0) invert(1)' }}
            />
          ) : (
            <div key={`bits-${idx}`} className="item" aria-hidden={idx >= logos.length}>
              {item}
            </div>
          )
        ))}
      </div>
    </div>
  )
}

const LogoLoopMobile = ({ heightClass = 'h-16', className = '' }: { heightClass?: string; className?: string }) => {
  const logos = useMemo(() => {
    const modules = import.meta.glob('../../assets/sponsors/*.{png,jpg,jpeg,svg,avif,webp}', {
      eager: true,
      query: '?url',
      import: 'default',
    }) as Record<string, string>
    const urls = Object.entries(modules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, url]) => url)
    return Array.from(new Set(urls))
  }, [])

  return (
    <BitsLogoLoop
      logos={logos}
      speed={30}
      direction="left"
      width="100%"
      logoHeight={96}
      gap={48}
      fadeOut={false}
      fadeOutColor="#2A579E"
      scaleOnHover={false}
      ariaLabel="Sponsors logos"
      className={`${heightClass} bg-[#2A579E] ${className}`}
    />
  )
}

export default LogoLoopMobile