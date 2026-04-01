'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const slides = [
  '/images/hero-slides/Hero-slides-phrames-1.png',
  '/images/hero-slides/Hero-slides-phrames-2.png',
  '/images/hero-slides/Hero-slides-phrames-3.png',
  '/images/hero-slides/Hero-slides-phrames-4.png',
  '/images/hero-slides/Hero-slides-phrames-5.png',
  '/images/hero-slides/Hero-slides-phrames-6.png',
]

const SLICES = 8

export default function HeroImageFader() {
  const [current, setCurrent] = useState(0)
  const [next, setNext] = useState(1)
  const [transitioning, setTransitioning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIdx = (current + 1) % slides.length
      setNext(nextIdx)
      setTransitioning(true)
      timeoutRef.current = setTimeout(() => {
        setCurrent(nextIdx)
        setTransitioning(false)
      }, 1000)
    }, 4000)
    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [current])

  return (
    <>
      <style>{`
        .slice-container {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
        }
        .slice { flex: 1; position: relative; overflow: hidden; }
        .slice-inner {
          position: absolute;
          left: 0; right: 0;
          height: calc(100% * ${SLICES});
          transform: translateY(110%);
          transition: transform 0.55s cubic-bezier(0.77, 0, 0.175, 1);
        }
        .slice-inner.active { transform: translateY(0%); }
        ${Array.from({ length: SLICES }, (_, i) => `
          .slice:nth-child(${i + 1}) .slice-inner {
            top: calc(-100% * ${i});
            transition-delay: ${i * 0.045}s;
          }
        `).join('')}

        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        .hero-float { animation: subtleFloat 5s ease-in-out infinite; }
      `}</style>

      <div className="w-[95%] sm:w-[85%] mx-auto">
        <div className="hero-float">
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{ aspectRatio: '1 / 1' }}
          >
            <Image
              src={slides[current]}
              alt="Phrames Hero"
              fill
              className="object-contain"
              priority
              quality={85}
              sizes="(max-width: 640px) 95vw, (max-width: 1024px) 50vw, 45vw"
            />
            <div className="slice-container" style={{ zIndex: 2 }}>
              {Array.from({ length: SLICES }, (_, i) => (
                <div key={i} className="slice">
                  <div className={`slice-inner${transitioning ? ' active' : ''}`}>
                    <Image
                      src={slides[next]}
                      alt="Phrames Hero"
                      fill
                      className="object-contain"
                      quality={85}
                      sizes="(max-width: 640px) 95vw, (max-width: 1024px) 50vw, 45vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
