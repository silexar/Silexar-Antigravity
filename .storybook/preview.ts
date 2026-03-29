import type { Preview } from '@storybook/react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // TIER 0 documentation standards
    docs: {
      toc: true, // Table of contents
      source: {
        type: 'code',
        language: 'tsx',
      },
    },
    // Enterprise-level accessibility
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'label',
            enabled: true,
          },
        ],
      },
    },
    // TIER 0 viewport configurations
    viewport: {
      viewports: {
        // Fortune 10 enterprise viewports
        enterpriseDesktop: {
          name: 'Enterprise Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
        enterpriseTablet: {
          name: 'Enterprise Tablet',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        mobilePro: {
          name: 'Mobile Pro',
          styles: {
            width: '375px',
            height: '812px',
          },
        },
      },
      defaultViewport: 'enterpriseDesktop',
    },
    // Background themes for TIER 0
    backgrounds: {
      default: 'enterprise',
      values: [
        {
          name: 'enterprise',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f172a',
        },
        {
          name: 'gray',
          value: '#f8fafc',
        },
      ],
    },
  },
  // Global decorators for all stories
  decorators: [
    (Story) => ({
      components: { Story },
      template: '<div class="min-h-screen bg-background"><Story /></div>',
    }),
  ],
  // TIER 0 global types
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark', 'system'],
        showName: true,
        dynamicTitle: true,
      },
    },
    tier: {
      name: 'TIER Level',
      description: 'TIER 0 configuration level',
      defaultValue: '0',
      toolbar: {
        icon: 'star',
        items: ['0', '1', '2'],
        showName: true,
      },
    },
  },
}

export default preview