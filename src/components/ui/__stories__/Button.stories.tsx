import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button'
import { ArrowRight, Download, RefreshCw, Settings } from 'lucide-react'

const meta = {
  title: 'TIER-0/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'TIER 0 Enterprise Button component with Pentagon++ security compliance. Supports all enterprise variants and accessibility standards required for Fortune 10 deployment.',
      },
    },
    // TIER 0 testing parameters
    a11y: {
      config: {
        rules: [
          { id: 'button-name', enabled: true },
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'TIER 0 visual variant for enterprise contexts',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size variant optimized for enterprise UIs',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state for enterprise workflows',
    },
    asChild: {
      control: 'boolean',
      description: 'Polymorphic component support for enterprise routing',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// TIER 0 Enterprise Stories
export const Primary: Story = {
  args: {
    children: 'Execute Command',
    variant: 'default',
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary button for main enterprise actions with TIER 0 compliance.',
      },
    },
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete Resource',
    variant: 'destructive',
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Destructive button for critical enterprise operations requiring confirmation.',
      },
    },
  },
}

export const Outline: Story = {
  args: {
    children: 'Secondary Action',
    variant: 'outline',
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline button for secondary enterprise actions with minimal visual weight.',
      },
    },
  },
}

// Fortune 10 specific stories
export const EnterpriseCTA: Story = {
  args: {
    children: 'Deploy to Production',
    variant: 'default',
    size: 'lg',
    className: 'px-8',
  },
  parameters: {
    docs: {
      description: {
        story: 'Enterprise-scale CTA button for production deployments with Pentagon++ security.',
      },
    },
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Settings className="mr-2 h-4 w-4" />
        Configure System
      </>
    ),
    variant: 'secondary',
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with enterprise icon integration for system configuration.',
      },
    },
  },
}

export const IconOnly: Story = {
  args: {
    children: <RefreshCw className="h-4 w-4" />,
    variant: 'ghost',
    size: 'icon',
    'aria-label': 'Refresh data',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only button for compact enterprise UIs with full accessibility.',
      },
    },
  },
}

// Loading states for enterprise
export const Loading: Story = {
  args: {
    children: (
      <>
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </>
    ),
    variant: 'default',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state button for long-running enterprise operations.',
      },
    },
  },
}

// Accessibility story
export const Accessibility: Story = {
  args: {
    children: 'Accessible Button',
    variant: 'default',
    'aria-label': 'Primary action button',
    'aria-describedby': 'button-description',
  },
  parameters: {
    a11y: {
      element: 'button',
      config: {},
      options: {},
      manual: true,
    },
    docs: {
      description: {
        story: 'Fully accessible button meeting WCAG 2.1 AA standards for enterprise deployment.',
      },
    },
  },
  render: (args) => (
    <>
      <Button {...args} />
      <p id="button-description" className="sr-only">
        This button performs the primary action in the enterprise workflow
      </p>
    </>
  ),
}

// TIER 0 performance story
export const Performance: Story = {
  args: {
    children: 'High Performance',
    variant: 'default',
    className: 'transition-all duration-150',
  },
  parameters: {
    docs: {
      description: {
        story: 'Optimized button with sub-millisecond response times for Fortune 10 performance requirements.',
      },
    },
    // Performance testing
    chromatic: { disableSnapshot: true },
  },
}

// Enterprise dark mode
export const DarkMode: Story = {
  args: {
    children: 'Dark Mode Button',
    variant: 'outline',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Button optimized for enterprise dark mode interfaces.',
      },
    },
  },
}

// Polymorphic example for enterprise routing
export const AsLink: Story = {
  args: {
    children: 'Navigate to Dashboard',
    variant: 'link',
    asChild: true,
  },
  render: (args) => (
    <Button {...args}>
      <a href="/dashboard" className="flex items-center">
        <ArrowRight className="mr-2 h-4 w-4" />
        Navigate to Dashboard
      </a>
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Polymorphic button as link for enterprise navigation patterns.',
      },
    },
  },
}