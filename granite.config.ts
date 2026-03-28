import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'kbo-ticket-calendar',
  brand: {
    displayName: 'KBO 티켓 캘린더',
    primaryColor: '#3182F6',
    icon: '', // TODO: 앱 아이콘 등록 후 URL 입력
  },
  permissions: [],
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});
