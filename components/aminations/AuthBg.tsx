'use client'

import { useEffect, useState, useRef } from 'react'

// ------- Types -------
interface Star {
  id: number
  top: string
  left: string
  size: number
  // Change delay and duration to number
  delay: number 
  duration: number 
  parallax: number
  opacity: number
}

interface NebulaCloud {
  id: number
  top: string
  left: string
  size: number
  color: string
  // Change delay and duration to number
  delay: number 
  duration: number 
  blur: number
  parallax: number
}

export default function AuthBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [nebulae, setNebulae] = useState<NebulaCloud[]>([])
  const [motionReduced, setMotionReduced] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Motion refs for RAF-driven parallax (no re-renders)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)

  // -------- Generate scene on mount (responsive counts) --------
  useEffect(() => {
    // Respect reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const setRm = () => setMotionReduced(mq.matches)
    setRm()
    mq.addEventListener?.('change', setRm)

    const w = window.innerWidth
    const h = window.innerHeight
    const isMobile = w < 640 // ~tailwind sm
    
    // Increased star count significantly for a dense Milky Way effect
    const starCount = mq.matches ? 150 : (isMobile ? 400 : 1000); 
    const nebulaCount = mq.matches ? 3 : (isMobile ? 5 : 8); // Keep nebula count for performance balance

    // Spiral galaxy-ish star distribution - more spread out, less concentrated around center
    const arms = 4;
    const armSpread = 1.0; // Increased spread for a wider galaxy feel

    const genStars: Star[] = []
    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2 * arms;
      // Use a lower power for distance to get more stars further out, simulating broader arms
      const distance = Math.random() ** 0.8 * 80; // Increased max distance
      const offsetX = (Math.random() - 0.5) * armSpread * (distance / 80);
      const offsetY = (Math.random() - 0.5) * armSpread * (distance / 80);
      const x = Math.cos(angle) * distance + offsetX;
      const y = Math.sin(angle) * distance + offsetY;

      genStars.push({
        id: i,
        top: `${50 + y * 0.9}%`, // Slightly adjust vertical spread
        left: `${50 + x * 0.9}%`, // Slightly adjust horizontal spread
        size: +(Math.random() * 1.2 + 0.2).toFixed(2), // Smaller average star size for density
        // Store duration and delay as numbers, not strings with 's'
        delay: +(Math.random() * 4).toFixed(2), 
        duration: +(Math.random() * 2 + 1.5).toFixed(2), 
        parallax: +(0.05 + distance / 100).toFixed(3), // Adjust parallax for depth
        opacity: +(0.4 + Math.random() * 0.5).toFixed(2), // Wider opacity range
      });
    }
    setStars(genStars);

    // Nebula colors (soft, layered) - keeping original colors as requested
    const nebulaColors = [
      'rgba(139, 92, 246, 0.16)', // violet
      'rgba(219, 39, 119, 0.14)', // fuchsia
      'rgba(14, 165, 233, 0.14)', // sky blue
      'rgba(34,197,94,0.10)',     // emerald hint
    ];
    const genNebulae: NebulaCloud[] = Array.from({ length: nebulaCount }, (_, i) => {
      const angle = Math.random() * Math.PI * 2 * arms;
      const distance = Math.random() * 50 + 10; // Nebulae can be a bit further out
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const sizeBase = Math.random() * (isMobile ? 150 : 250) + (isMobile ? 180 : 200); // Slightly larger nebulae
      return {
        id: i,
        top: `${50 + y * 0.8}%`,
        left: `${50 + x * 0.8}%`,
        size: Math.round(sizeBase),
        color: nebulaColors[i % nebulaColors.length],
        // Store duration and delay as numbers, not strings with 's'
        delay: +(Math.random() * 4).toFixed(2),
        duration: +(Math.random() * 40 + 30).toFixed(2), 
        blur: Math.round(sizeBase / 2.5),
        parallax: +(0.2 + Math.random() * 0.4).toFixed(2),
      };
    });
    setNebulae(genNebulae);

    // Clean up media listener
    return () => mq.removeEventListener?.('change', setRm)
  }, []);

  // -------- Pointer & Tilt Parallax -> CSS variables (no re-render) --------
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let active = true

    const setVars = (x: number, y: number) => {
      root.style.setProperty('--mx', x.toFixed(3))
      root.style.setProperty('--my', y.toFixed(3))
    }

    // Pointer move (desktop & touch drag)
    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      targetRef.current.x = nx
      targetRef.current.y = ny
    }

    // Device tilt (mobile)
    const onDeviceTilt = (e: DeviceOrientationEvent) => {
      // gamma: left-right, beta: front-back; normalize a bit
      const nx = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 45))
      const ny = Math.max(-1, Math.min(1, (e.beta ?? 0) / 45))
      targetRef.current.x = nx
      targetRef.current.y = ny
    }

    // Auto idle drift if no input
    let lastInput = performance.now()
    const onAnyInput = () => (lastInput = performance.now())

    const step = () => {
      if (!active) return
      const now = performance.now()
      // If idle for a while, gently drift
      if (now - lastInput > 1500) {
        const t = now * 0.0002; // Slower idle drift for a calmer feel
        targetRef.current.x = Math.sin(t) * 0.1; // Less intense idle drift
        targetRef.current.y = Math.cos(t * 1.5) * 0.08; // Less intense idle drift
      }
      // Interpolate current -> target for smoothness
      const ease = motionReduced ? 0.25 : 0.06; // Even smoother interpolation for a "swimming" feel
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease
      setVars(currentRef.current.x, currentRef.current.y)
      rafRef.current = requestAnimationFrame(step)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointermove', onAnyInput, { passive: true })
    window.addEventListener('touchstart', onAnyInput, { passive: true })
    window.addEventListener('mousemove', onAnyInput, { passive: true })

    // Device orientation (best-effort)
    if ('DeviceOrientationEvent' in window) {
      // Some browsers require secure context & permission; try/catch silently
      try {
        window.addEventListener('deviceorientation', onDeviceTilt as any)
      } catch {}
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      active = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointermove', onAnyInput)
      window.removeEventListener('touchstart', onAnyInput)
      window.removeEventListener('mousemove', onAnyInput)
      try {
        window.removeEventListener('deviceorientation', onDeviceTilt as any)
      } catch {}
    }
  }, [motionReduced])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 -z-50 w-screen h-screen overflow-hidden bg-slate-950"
      // CSS vars default values
      style={
        {
          // motion tuning
          // parallax multiplier for layers
          // tweak freely if you want more/less motion
          ['--mx' as any]: 0,
          ['--my' as any]: 0,
          ['--parallax-base' as any]: 24, // Slightly less base parallax for more gentle movement
          ['--scale' as any]: 1.25, // Slightly more zoomed in to fill the screen
        } as React.CSSProperties
      }
    >
      {/* Deep gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deeper, more expansive radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(150%_100%_at_50%_30%,#0a101c_0%,#04060c_75%,#010206_100%)]" />
        {/* Stronger, more encompassing subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,transparent_60%,rgba(0,0,0,0.65)_100%)]" />
        {/* grain to fight banding */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' viewBox=\'0 0 120 120\'>\
<filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/>\
<feColorMatrix type=\'saturate\' values=\'0\'/>\
</filter>\
<rect width=\'120\' height=\'120\' filter=\'url(%23n)\' opacity=\'0.4\'/>\
</svg>")' }} />
      </div>

      {/* Galaxy container (rotates very slowly) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate(calc(var(--mx) * var(--parallax-base) * 1px), calc(var(--my) * var(--parallax-base) * 1px)) scale(var(--scale))`,
          transition: 'transform 0.2s ease-out',
          animation: motionReduced ? undefined : 'galaxy-rotate 360s linear infinite', // Even slower, calmer rotation
        }}
      >
        {/* Galaxy core — responsive size, made more ethereal */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: 'min(75vw, 75vh)', // Larger core, filling more space
            height: 'min(75vw, 75vh)', // Larger core
            background:
              'radial-gradient(ellipse at center, rgba(251,242,219,0.7) 0%, rgba(251,242,219,0.25) 35%, rgba(251,242,219,0.0) 70%)', // Brighter, more diffuse core
            filter: 'blur(36px)', // More blur for a softer look
            animation: motionReduced ? undefined : 'core-pulse 12s ease-in-out infinite', // Slower, gentler pulse
          }}
        />

        {/* Nebula layers (parallax + drift) */}
        {nebulae.map((n) => (
          <div
            key={n.id}
            className="absolute rounded-full pointer-events-none will-change-transform"
            style={{
              width: `${n.size * 1.1}px`, // Slightly larger nebulae
              height: `${n.size * 1.1}px`, // Slightly larger nebulae
              top: n.top,
              left: n.left,
              backgroundColor: n.color,
              filter: `blur(${n.blur * 1.1}px)`, // More blur for smoother clouds
              transform: `translate(calc(-50% + var(--mx) * ${n.parallax * 7}px), calc(-50% + var(--my) * ${n.parallax * 7}px))`, // Less parallax for nebulae
              // FIX APPLIED HERE: Ensure 's' unit is explicitly added
              animation: motionReduced ? undefined : `nebula-drift ${n.duration * 0.8}s ease-in-out ${n.delay * 0.9}s infinite`,
            }}
          />
        ))}

        {/* Starfield (denser, faster twinkle for "swimming" effect) */}
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white will-change-transform pointer-events-none"
            style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              top: s.top,
              left: s.left,
              opacity: s.opacity,
              // Reduced parallax multiplier for stars to make them feel closer and flow more
              transform: `translate(calc(-50% + var(--mx) * ${s.parallax * 4}px), calc(-50% + var(--my) * ${s.parallax * 4}px))`, 
              // FIX APPLIED HERE: Ensure 's' unit is explicitly added
              animation: motionReduced ? undefined : `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              boxShadow: '0 0 4px rgba(255,255,255,0.4)', // Softer glow
            }}
          />
        ))}

        {/* Shooting stars (fewer, slower, more subtle; disabled in reduced motion) */}
        {!motionReduced &&
          [0, 1].map((i) => ( // Fewer shooting stars
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                top: `${20 + i * 30}%`, // Position them slightly differently
                left: `${(i * 45) % 90 + 5}%`,
                width: '180px', // Slightly longer
                height: '1.8px', // Slightly thinner
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.0) 100%)', // Softer gradient
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.4))',
                transform: `translate(-50%, -50%) rotate(calc(-15deg + (var(--mx) * 8deg)))`, // Gentle rotation influence
                // FIX APPLIED HERE: Ensure 's' unit is explicitly added
                animation: `shoot ${35 + i * 8}s linear ${i * 10}s infinite`, // Slower animation, longer delays
                opacity: 0.5, // More subtle
              }}
            />
          ))}
      </div>

      {/* Mouse/Touch aura (stays outside rotation for depth) */}
      <div
        className="absolute top-0 left-0 w-[45vmin] h-[45vmin] rounded-full pointer-events-none will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(165,243,252,0.06) 0%, rgba(165,243,252,0.0) 65%)', // Even subtler aura, wider spread
          transform:
            'translate(calc(50vw + var(--mx) * 25vw - 50%), calc(50vh + var(--my) * 25vh - 50%))', // Less aura movement
          transition: 'transform 0.08s ease-out', // Quicker aura response
        }}
      />

      {/* Top/bottom soft color washes for depth - made larger and more subtle */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[180vmin] h-[60vmin] rounded-[100%] bg-[radial-gradient(closest-side,rgba(56,189,248,0.06),rgba(56,189,248,0))] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[180vmin] h-[60vmin] rounded-[100%] bg-[radial-gradient(closest-side,rgba(168,85,247,0.06),rgba(168,85,247,0))] blur-3xl pointer-events-none" />

      {/* CSS Keyframes / Utilities */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1); } // Brighter at peak twinkle
        }

        @keyframes nebula-drift {
          0% { transform: translate(calc(-50% + var(--mx)*0px), calc(-50% + var(--my)*0px)) rotate(0deg) scale(1); }
          50% { transform: translate(calc(-50% + var(--mx)*0px), calc(-50% + var(--my)*0px)) rotate(60deg) scale(1.03); } // Less scale change
          100% { transform: translate(calc(-50% + var(--mx)*0px), calc(-50% + var(--my)*0px)) rotate(120deg) scale(1); } // Reduced rotation
        }

        @keyframes galaxy-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes core-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.7; } // Softer pulse
        }

        @keyframes shoot {
          0% { transform: translate(-150vw, -50%) rotate(calc(-15deg + (var(--mx) * 8deg))); opacity: 0; }
          5% { opacity: 0.5; }
          50% { opacity: 0.4; }
          100% { transform: translate(25vw, -50%) rotate(calc(-15deg + (var(--mx) * 8deg))); opacity: 0; }
        }

        /* Reduce motion: strip heavy animations for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .will-change-transform { will-change: auto; }
        }
      `}</style>
    </div>
  )
}