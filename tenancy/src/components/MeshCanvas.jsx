import { useEffect, useRef } from 'react'

const RADII = [3, 4, 4, 5, 6, 9, 11]
const MARGIN = 24
const MAX_EDGES = 5
const BASE_STROKE_ALPHA = 0.65

const COLORS = {
  light: '#003A6C',
  dark: '#FF3D78',
}

function createNodes(width, height) {
  const area = Math.max(width * height, 1)
  const count = Math.max(22, Math.min(68, Math.floor(area / 26000)))
  const nodes = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.14 + Math.random() * 0.18
    nodes.push({
      x: Math.random() * (width + MARGIN * 2) - MARGIN,
      y: Math.random() * (height + MARGIN * 2) - MARGIN,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: RADII[Math.floor(Math.random() * RADII.length)],
    })
  }
  return nodes
}

export default function MeshCanvas({ variant = 'light', className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const color = COLORS[variant] || COLORS.light
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let nodes = []
    let rafId = 0
    let lastTime = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const nextW = Math.max(1, Math.round(rect.width))
      const nextH = Math.max(1, Math.round(rect.height))
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2)
      if (nextW === width && nextH === height && nextDpr === dpr) return

      const prevW = width || nextW
      const prevH = height || nextH
      width = nextW
      height = nextH
      dpr = nextDpr

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (nodes.length === 0) {
        nodes = createNodes(width, height)
      } else {
        const sx = width / prevW
        const sy = height / prevH
        for (const n of nodes) {
          n.x *= sx
          n.y *= sy
        }
      }
    }

    const step = (dtScale) => {
      for (const n of nodes) {
        n.x += n.vx * dtScale
        n.y += n.vy * dtScale

        if (n.x < -MARGIN) {
          n.x = -MARGIN
          n.vx = Math.abs(n.vx)
        } else if (n.x > width + MARGIN) {
          n.x = width + MARGIN
          n.vx = -Math.abs(n.vx)
        }

        if (n.y < -MARGIN) {
          n.y = -MARGIN
          n.vy = Math.abs(n.vy)
        } else if (n.y > height + MARGIN) {
          n.y = height + MARGIN
          n.vy = -Math.abs(n.vy)
        }
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const maxDist = Math.min(width, height) < 320 ? 140 : 220
      const maxDistSq = maxDist * maxDist
      const nCount = nodes.length
      const edgeCount = new Uint8Array(nCount)
      const nearestIdx = new Int16Array(nCount).fill(-1)
      const nearestDistSq = new Float32Array(nCount).fill(Infinity)

      ctx.strokeStyle = color
      ctx.lineWidth = 1.2

      for (let i = 0; i < nCount; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nCount; j++) {
          const b = nodes[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dSq = dx * dx + dy * dy

          if (dSq < nearestDistSq[i]) {
            nearestDistSq[i] = dSq
            nearestIdx[i] = j
          }
          if (dSq < nearestDistSq[j]) {
            nearestDistSq[j] = dSq
            nearestIdx[j] = i
          }

          if (dSq < maxDistSq && edgeCount[i] < MAX_EDGES && edgeCount[j] < MAX_EDGES) {
            const d = Math.sqrt(dSq)
            ctx.globalAlpha = (1 - d / maxDist) * BASE_STROKE_ALPHA
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
            edgeCount[i]++
            edgeCount[j]++
          }
        }
      }

      // Guarantee no node is ever left without an edge
      for (let i = 0; i < nCount; i++) {
        if (edgeCount[i] === 0 && nearestIdx[i] !== -1) {
          const a = nodes[i]
          const b = nodes[nearestIdx[i]]
          ctx.globalAlpha = 0.24
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
          edgeCount[i]++

          // Gentle steering nudge so isolated nodes drift back toward the network
          const dx = b.x - a.x
          const dy = b.y - a.y
          const len = Math.hypot(dx, dy) || 1
          a.vx += (dx / len) * 0.004
          a.vy += (dy / len) * 0.004
          const speed = Math.hypot(a.vx, a.vy)
          if (speed > 0.34) {
            a.vx = (a.vx / speed) * 0.34
            a.vy = (a.vy / speed) * 0.34
          }
        }
      }

      const nodeScale = window.innerWidth <= 760 ? 0.55 : 1
      ctx.fillStyle = color
      ctx.globalAlpha = 0.78
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * nodeScale, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const loop = (now) => {
      const dtMs = Math.min(now - lastTime, 32)
      lastTime = now
      step(dtMs / 16.6667)
      draw()
      rafId = requestAnimationFrame(loop)
    }

    const start = () => {
      if (rafId || reducedMotion || document.visibilityState === 'hidden') return
      lastTime = performance.now()
      rafId = requestAnimationFrame(loop)
    }

    const stop = () => {
      if (!rafId) return
      cancelAnimationFrame(rafId)
      rafId = 0
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stop()
      else start()
    }

    resize()
    draw()

    const ro = new ResizeObserver(() => {
      resize()
      if (reducedMotion) draw()
    })
    ro.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)
    start()

    return () => {
      stop()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [variant])

  return <canvas ref={canvasRef} className={`mesh-canvas ${className}`.trim()} aria-hidden="true" />
}
