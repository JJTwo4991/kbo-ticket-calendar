export interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  stadium: string;
  ticketUrl: string;
  ticketPlatform: string;
  color: string;
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
  },
  LG: {
    id: 'LG',
    name: 'LG 트윈스',
    shortName: 'LG',
    stadium: '서울종합운동장 야구장',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/59',
    ticketPlatform: '티켓링크',
    color: '#C30452',
  },
  두산: {
    id: '두산',
    name: '두산 베어스',
    shortName: '두산',
    stadium: '서울종합운동장 야구장',
    ticketUrl: 'https://ticket.interpark.com',
    ticketPlatform: '놀티켓',
    color: '#131230',
  },
  키움: {
    id: '키움',
    name: '키움 히어로즈',
    shortName: '키움',
    stadium: '고척스카이돔',
    ticketUrl: 'https://ticket.interpark.com',
    ticketPlatform: '놀티켓',
    color: '#820024',
  },
  KT: {
    id: 'KT',
    name: 'KT 위즈',
    shortName: 'KT',
    stadium: '수원KT위즈파크',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/62',
    ticketPlatform: '티켓링크',
    color: '#000000',
  },
  NC: {
    id: 'NC',
    name: 'NC 다이노스',
    shortName: 'NC',
    stadium: '창원NC파크',
    ticketUrl: 'https://ticket.ncdinos.com',
    ticketPlatform: 'NC다이노스',
    color: '#315288',
  },
  삼성: {
    id: '삼성',
    name: '삼성 라이온즈',
    shortName: '삼성',
    stadium: '대구삼성라이온즈파크',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/57',
    ticketPlatform: '티켓링크',
    color: '#074CA1',
  },
  롯데: {
    id: '롯데',
    name: '롯데 자이언츠',
    shortName: '롯데',
    stadium: '사직야구장',
    ticketUrl: 'https://www.giantsclub.com/html/?pcode=339',
    ticketPlatform: '롯데자이언츠',
    color: '#002955',
  },
  한화: {
    id: '한화',
    name: '한화 이글스',
    shortName: '한화',
    stadium: '대전한화생명이글스파크',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/63',
    ticketPlatform: '티켓링크',
    color: '#FF6600',
  },
  KIA: {
    id: 'KIA',
    name: 'KIA 타이거즈',
    shortName: 'KIA',
    stadium: '광주기아챔피언스필드',
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/58',
    ticketPlatform: '티켓링크',
    color: '#EA0029',
  },
};

export const teamIds = ['SSG', 'LG', '두산', '키움', 'KT', 'NC', '삼성', '롯데', '한화', 'KIA'];

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
