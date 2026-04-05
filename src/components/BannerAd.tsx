import { useEffect, useRef, useState, useCallback } from 'react'
import './BannerAd.css'

// 토스 앱인토스 환경에서만 동작하는 배너 광고
// 웹 환경에서는 자동으로 숨겨짐

interface BannerAdProps {
  adGroupId?: string
}

export default function BannerAd({ adGroupId = 'ait.v2.live.5dc9fddd39004b3b' }: BannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // SDK 초기화
  useEffect(() => {
    async function init() {
      try {
        const { TossAds } = await import('@apps-in-toss/web-framework')
        if (!TossAds?.initialize?.isSupported?.()) {
          setIsSupported(false)
          return
        }
        setIsSupported(true)
        TossAds.initialize({
          callbacks: {
            onInitialized: () => setIsInitialized(true),
            onInitializationFailed: (error: Error) => {
              console.error('[BannerAd] SDK 초기화 실패:', error)
            },
          },
        })
      } catch {
        // @apps-in-toss/web-framework가 없거나 웹 환경
        setIsSupported(false)
      }
    }
    init()
  }, [])

  // 배너 부착
  const attachBanner = useCallback(async () => {
    if (!isInitialized || !containerRef.current) return

    try {
      const { TossAds } = await import('@apps-in-toss/web-framework')
      const attached = TossAds.attachBanner(adGroupId, containerRef.current, {
        theme: 'auto',
        tone: 'blackAndWhite',
        variant: 'expanded',
        callbacks: {
          onAdRendered: () => console.log('[BannerAd] 광고 렌더링 완료'),
          onAdImpression: () => console.log('[BannerAd] 광고 노출 기록'),
          onNoFill: () => console.log('[BannerAd] 표시할 광고 없음'),
          onAdFailedToRender: (payload: { error: { message: string } }) => {
            console.error('[BannerAd] 렌더링 실패:', payload.error.message)
          },
        },
      })

      return () => {
        attached?.destroy()
      }
    } catch {
      console.error('[BannerAd] 배너 부착 실패')
    }
  }, [isInitialized, adGroupId])

  useEffect(() => {
    const cleanup = attachBanner()
    return () => {
      cleanup?.then(fn => fn?.())
    }
  }, [attachBanner])

  // 웹 환경에서는 렌더링하지 않음
  if (!isSupported) return null

  return (
    <div className="banner-ad">
      <div ref={containerRef} className="banner-ad__container" />
    </div>
  )
}
