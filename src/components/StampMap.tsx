import { useEffect, useRef, useState } from 'react'
import { teams } from '../data/teams'
import './StampMap.css'

interface StadiumLocation {
  name: string
  lat: number
  lng: number
  homeTeam: string
}

const STADIUMS: StadiumLocation[] = [
  { name: '서울종합운동장 야구장', lat: 37.5122, lng: 127.0719, homeTeam: 'LG' },
  { name: '고척스카이돔', lat: 37.4982, lng: 126.8672, homeTeam: '키움' },
  { name: '인천SSG랜더스필드', lat: 37.4370, lng: 126.6932, homeTeam: 'SSG' },
  { name: '수원KT위즈파크', lat: 37.2997, lng: 127.0095, homeTeam: 'KT' },
  { name: '대전한화생명이글스파크', lat: 36.3171, lng: 127.4291, homeTeam: '한화' },
  { name: '대구삼성라이온즈파크', lat: 35.8411, lng: 128.6815, homeTeam: '삼성' },
  { name: '창원NC파크', lat: 35.2225, lng: 128.5822, homeTeam: 'NC' },
  { name: '광주기아챔피언스필드', lat: 35.1681, lng: 126.8889, homeTeam: 'KIA' },
  { name: '사직야구장', lat: 35.1940, lng: 129.0616, homeTeam: '롯데' },
]

interface StampMapProps {
  visitedStadiums?: Set<string>
  visitCounts?: Record<string, number>
}

declare global {
  interface Window {
    naver: any
  }
}

export default function StampMap({ visitedStadiums = new Set(), visitCounts = {} }: StampMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 네이버 지도 스크립트 동적 로드
  useEffect(() => {
    if (window.naver?.maps) {
      setMapLoaded(true)
      return
    }

    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID || 'xfej4gy15e'
    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`
    script.async = true
    script.onload = () => setMapLoaded(true)
    script.onerror = () => setError('지도를 불러올 수 없어요')
    document.head.appendChild(script)

    return () => {
      // 스크립트 제거하지 않음 (한번 로드되면 유지)
    }
  }, [])

  // 지도 초기화 + 마커 배치
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.naver?.maps) return

    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(36.5, 127.5),
      zoom: 7,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
    })

    // 마커 배치
    STADIUMS.forEach(stadium => {
      const isVisited = visitedStadiums.has(stadium.name)
      const count = visitCounts[stadium.name] || 0
      const teamInfo = teams[stadium.homeTeam]
      const color = isVisited ? (teamInfo?.color || '#3182F6') : '#B0B8C1'

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(stadium.lat, stadium.lng),
        map,
        icon: {
          content: `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
            ">
              <div style="
                width: ${isVisited ? 32 : 24}px;
                height: ${isVisited ? 32 : 24}px;
                border-radius: 50%;
                background: ${color};
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${isVisited ? 11 : 9}px;
                font-weight: 700;
                color: white;
              ">
                ${isVisited ? count : ''}
              </div>
              <div style="
                font-size: 10px;
                font-weight: 600;
                color: ${isVisited ? '#333D4B' : '#B0B8C1'};
                margin-top: 2px;
                white-space: nowrap;
                text-shadow: 0 0 3px white, 0 0 3px white;
              ">
                ${teamInfo?.shortName || stadium.homeTeam}
              </div>
            </div>
          `,
          anchor: new window.naver.maps.Point(isVisited ? 16 : 12, isVisited ? 16 : 12),
        },
      })

      // 인포윈도우
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px 14px; font-family: sans-serif; min-width: 140px;">
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">${stadium.name}</div>
            <div style="font-size: 12px; color: #8B95A1;">홈: ${teamInfo?.name || stadium.homeTeam}</div>
            <div style="font-size: 12px; color: ${isVisited ? '#14C47E' : '#B0B8C1'}; font-weight: 600; margin-top: 4px;">
              ${isVisited ? `✅ ${count}회 방문` : '미방문'}
            </div>
          </div>
        `,
        borderWidth: 0,
        backgroundColor: 'white',
        borderColor: 'transparent',
        anchorSize: new window.naver.maps.Size(8, 8),
      })

      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close()
        } else {
          infoWindow.open(map, marker)
        }
      })
    })
  }, [mapLoaded, visitedStadiums, visitCounts])

  if (error) {
    return (
      <div className="stamp-map">
        <h3 className="stamp-map__title">📍 도장깨기</h3>
        <div className="stamp-map__error">{error}</div>
      </div>
    )
  }

  return (
    <div className="stamp-map">
      <h3 className="stamp-map__title">📍 도장깨기</h3>
      <div className="stamp-map__legend">
        <span className="stamp-map__legend-item stamp-map__legend-item--visited">● 방문</span>
        <span className="stamp-map__legend-item stamp-map__legend-item--not">● 미방문</span>
      </div>
      <div className="stamp-map__container" ref={mapRef} />
    </div>
  )
}
