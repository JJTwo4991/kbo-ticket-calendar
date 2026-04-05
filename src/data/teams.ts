import ssgLogo from '../assets/logos/ssg.svg'
import lgLogo from '../assets/logos/lg.svg'
import doosanLogo from '../assets/logos/doosan.svg'
import kiwoomLogo from '../assets/logos/kiwoom.svg'
import ktLogo from '../assets/logos/kt.svg'
import ncLogo from '../assets/logos/nc.svg'
import samsungLogo from '../assets/logos/samsung.svg'
import lotteLogo from '../assets/logos/lotte.svg'
import hanwhaLogo from '../assets/logos/hanwha.svg'
import kiaLogo from '../assets/logos/kia.svg'

export interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  stadium: string;
  ticketUrl: string;
  ticketPlatform: string;
  color: string;
  logo: string;
}

export const teams: Record<string, TeamInfo> = {
  SSG: {
    id: 'SSG',
    name: 'SSG 랜더스',
    shortName: 'SSG',
    stadium: '인천SSG랜더스필드',
    ticketUrl: 'https://ticket.ssg.com',
    ticketPlatform: 'SSG닷컴',
    color: '#CE0E2D',
    logo: ssgLogo,
  },
  LG: {
    id: 'LG',
    name: 'LG 트윈스',
    shortName: 'LG',
    stadium: '서울종합운동장 야구장',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/59',
    ticketPlatform: '티켓링크',
    color: '#C30452',
    logo: lgLogo,
  },
  두산: {
    id: '두산',
    name: '두산 베어스',
    shortName: '두산',
    stadium: '서울종합운동장 야구장',
    ticketUrl: 'https://ticket.interpark.com',
    ticketPlatform: '놀티켓',
    color: '#131230',
    logo: doosanLogo,
  },
  키움: {
    id: '키움',
    name: '키움 히어로즈',
    shortName: '키움',
    stadium: '고척스카이돔',
    ticketUrl: 'https://ticket.interpark.com',
    ticketPlatform: '놀티켓',
    color: '#820024',
    logo: kiwoomLogo,
  },
  KT: {
    id: 'KT',
    name: 'KT 위즈',
    shortName: 'KT',
    stadium: '수원KT위즈파크',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/62',
    ticketPlatform: '티켓링크',
    color: '#000000',
    logo: ktLogo,
  },
  NC: {
    id: 'NC',
    name: 'NC 다이노스',
    shortName: 'NC',
    stadium: '창원NC파크',
    ticketUrl: 'https://ticket.ncdinos.com',
    ticketPlatform: 'NC다이노스',
    color: '#315288',
    logo: ncLogo,
  },
  삼성: {
    id: '삼성',
    name: '삼성 라이온즈',
    shortName: '삼성',
    stadium: '대구삼성라이온즈파크',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/57',
    ticketPlatform: '티켓링크',
    color: '#074CA1',
    logo: samsungLogo,
  },
  롯데: {
    id: '롯데',
    name: '롯데 자이언츠',
    shortName: '롯데',
    stadium: '사직야구장',
    ticketUrl: 'https://www.giantsclub.com/html/?pcode=339',
    ticketPlatform: '롯데자이언츠',
    color: '#002955',
    logo: lotteLogo,
  },
  한화: {
    id: '한화',
    name: '한화 이글스',
    shortName: '한화',
    stadium: '대전한화생명이글스파크',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/63',
    ticketPlatform: '티켓링크',
    color: '#FF6600',
    logo: hanwhaLogo,
  },
  KIA: {
    id: 'KIA',
    name: 'KIA 타이거즈',
    shortName: 'KIA',
    stadium: '광주기아챔피언스필드',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/58',
    ticketPlatform: '티켓링크',
    color: '#EA0029',
    logo: kiaLogo,
  },
};

export const teamIds = ['SSG', 'LG', '두산', '키움', 'KT', 'NC', '삼성', '롯데', '한화', 'KIA'];

// 구장별 지역 그룹 (schedule.json의 stadium 값과 매칭)
export interface StadiumInfo {
  id: string;
  name: string;
  city: string;
  stadiums: string[]; // schedule.json의 stadium 필드 값들
}

export const stadiumGroups: StadiumInfo[] = [
  { id: 'seoul', name: '서울', city: '서울', stadiums: ['서울종합운동장 야구장', '고척스카이돔'] },
  { id: 'incheon', name: '인천', city: '인천', stadiums: ['인천SSG랜더스필드'] },
  { id: 'suwon', name: '수원', city: '수원', stadiums: ['수원KT위즈파크'] },
  { id: 'daejeon', name: '대전', city: '대전', stadiums: ['대전한화생명이글스파크'] },
  { id: 'daegu', name: '대구', city: '대구', stadiums: ['대구삼성라이온즈파크'] },
  { id: 'changwon', name: '창원', city: '창원', stadiums: ['창원NC파크'] },
  { id: 'gwangju', name: '광주', city: '광주', stadiums: ['광주기아챔피언스필드'] },
  { id: 'busan', name: '부산', city: '부산', stadiums: ['사직야구장'] },
];

export function getTeamInfo(teamId: string): TeamInfo | undefined {
  return teams[teamId];
}

export function getTicketInfo(homeTeamId: string): { url: string; platform: string } {
  const team = teams[homeTeamId];
  if (!team) {
    return { url: 'https://www.ticketlink.co.kr', platform: '티켓링크' };
  }
  return { url: team.ticketUrl, platform: team.ticketPlatform };
}
