import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fintab.app',
  appName: 'Fintab',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
