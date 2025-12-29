import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    'storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  typescript: {
    check: false,
  },
  docs: {
    defaultName: 'Documentation',
  },
}

export default config
