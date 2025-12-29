import type { Meta, StoryObj } from '@storybook/vue3'
import { Button } from '.'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'glass', 'glass-dark', 'glass-teal'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
  args: {
    variant: 'default',
    size: 'default',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Button</Button>',
  }),
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Delete</Button>',
  }),
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Outline</Button>',
  }),
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Secondary</Button>',
  }),
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Ghost</Button>',
  }),
}

export const Link: Story = {
  args: {
    variant: 'link',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Link</Button>',
  }),
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Small</Button>',
  }),
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Large</Button>',
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Button },
    template: '<Button disabled>Disabled</Button>',
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap gap-4">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    `,
  }),
}

export const AllSizes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap items-center gap-4">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    `,
  }),
}

export const GlassButton: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="p-8 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-2xl">
        <div class="flex flex-wrap items-center gap-4">
          <Button variant="glass">Glass Button</Button>
          <Button variant="glass" size="sm">Small Glass</Button>
          <Button variant="glass" size="lg">Large Glass</Button>
        </div>
      </div>
    `,
  }),
}

export const GlassDarkButton: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="p-8 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl">
        <div class="flex flex-wrap items-center gap-4">
          <Button variant="glass-dark">Glass Dark</Button>
          <Button variant="glass-dark" size="sm">Small</Button>
          <Button variant="glass-dark" size="lg">Large</Button>
        </div>
      </div>
    `,
  }),
}

export const GlassTealButton: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="p-8 bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 rounded-2xl">
        <div class="flex flex-wrap items-center gap-4">
          <Button variant="glass-teal">Glass Teal</Button>
          <Button variant="glass-teal" size="sm">Small</Button>
          <Button variant="glass-teal" size="lg">Large</Button>
        </div>
      </div>
    `,
  }),
}

export const GlassButtonsShowcase: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="space-y-6">
        <div class="p-8 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl">
          <p class="text-white/80 text-sm mb-4">On purple gradient</p>
          <div class="flex flex-wrap items-center gap-4">
            <Button variant="glass">Submit Testimonial</Button>
            <Button variant="glass" size="sm">Cancel</Button>
          </div>
        </div>
        <div class="p-8 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-2xl">
          <p class="text-white/80 text-sm mb-4">On teal gradient (brand color)</p>
          <div class="flex flex-wrap items-center gap-4">
            <Button variant="glass">Get Started</Button>
            <Button variant="glass-teal">Learn More</Button>
          </div>
        </div>
        <div class="p-8 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl">
          <p class="text-white/60 text-sm mb-4">On dark gradient</p>
          <div class="flex flex-wrap items-center gap-4">
            <Button variant="glass-dark">View Dashboard</Button>
            <Button variant="glass-dark" size="sm">Settings</Button>
          </div>
        </div>
      </div>
    `,
  }),
}
