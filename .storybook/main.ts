import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-onboarding',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // TIER 0 optimizations for enterprise
    config.build = config.build || {}
    config.build.chunkSizeWarningLimit = 1000
    config.build.rollupOptions = {
      ...config.build.rollupOptions,
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-*', 'lucide-react'],
          'chart-vendor': ['recharts', 'd3'],
          'utils-vendor': ['date-fns', 'uuid', 'zustand'],
        },
      },
    }
    
    return config
  },
  features: {
    // Enable TIER 0 features
    storyStoreV7: true,
    buildStoriesJson: true,
    disableTelemetry: true, // Enterprise privacy
  },
  env: (config) => ({
    ...config,
    // TIER 0 environment variables
    STORYBOOK_TIER_LEVEL: '0',
    STORYBOOK_ENTERPRISE_MODE: 'true',
    STORYBOOK_FORTUNE10_READY: 'true',
  }),
}

export default config