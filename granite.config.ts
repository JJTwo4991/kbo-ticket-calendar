import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'gameday',
  brand: {
    displayName: '직관갈래',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/appsintoss/25433/6458cb3a-767c-415a-a8a0-faad09ebc6b4.png',
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
      dev: 'npx vite --host',
      build: 'npx tsc -b && npx vite build',
    },
  },
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});
