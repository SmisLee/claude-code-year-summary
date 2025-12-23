'use client'

import { useEffect, useRef, useState } from 'react'

interface AdSlotProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // IntersectionObserver로 뷰포트 진입 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (adRef.current) {
      observer.observe(adRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // 광고 초기화
  useEffect(() => {
    if (!isVisible || isLoaded) return

    // LCP 완료 후 광고 로드
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        pushAd()
      })
    } else {
      setTimeout(pushAd, 100)
    }
  }, [isVisible, isLoaded])

  const pushAd = () => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
        setIsLoaded(true)
      }
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }

  return (
    <div
      ref={adRef}
      className={`ad-container ${className}`}
      style={{ minHeight: '90px' }}
    >
      {isVisible && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-2942250321314936"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
