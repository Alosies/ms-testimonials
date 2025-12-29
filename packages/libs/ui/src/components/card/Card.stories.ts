import type { Meta, StoryObj } from '@storybook/vue3'
import { Button } from '../button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '.'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component for displaying content in a contained format. Supports glass variants for glassmorphism effects.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'glass', 'glass-dark', 'glass-teal'],
      description: 'Visual style variant of the card',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button },
    template: `
      <Card class="w-[350px]">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </Card>
    `,
  }),
}

export const Simple: Story = {
  render: () => ({
    components: { Card, CardContent },
    template: `
      <Card class="w-[350px]">
        <CardContent class="pt-6">
          <p>Simple card with just content.</p>
        </CardContent>
      </Card>
    `,
  }),
}

export const WithHeader: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent },
    template: `
      <Card class="w-[350px]">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>You have 3 unread messages.</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            Check your inbox for the latest updates.
          </p>
        </CardContent>
      </Card>
    `,
  }),
}

export const Testimonial: Story = {
  render: () => ({
    components: { Card, CardContent },
    template: `
      <Card class="w-[400px]">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span class="text-sm font-medium text-primary">JD</span>
            </div>
            <div>
              <p class="font-medium text-sm">John Doe</p>
              <p class="text-xs text-muted-foreground">CEO at Acme Inc.</p>
            </div>
          </div>
          <p class="text-sm text-muted-foreground italic">
            "This product has completely transformed how we collect customer feedback.
            The AI-powered prompts make it incredibly easy for our customers to share their experiences."
          </p>
        </CardContent>
      </Card>
    `,
  }),
}

export const PricingCard: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button },
    template: `
      <Card class="w-[300px]">
        <CardHeader>
          <CardTitle>Pro Plan</CardTitle>
          <CardDescription>For growing businesses</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold">$29</div>
          <p class="text-sm text-muted-foreground">per month</p>
          <ul class="mt-4 space-y-2 text-sm">
            <li>Unlimited testimonials</li>
            <li>Custom branding</li>
            <li>Priority support</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button class="w-full">Subscribe</Button>
        </CardFooter>
      </Card>
    `,
  }),
}

export const GlassCard: Story = {
  parameters: {
    backgrounds: { default: 'gradient' },
  },
  render: () => ({
    components: { Card, CardContent },
    template: `
      <div class="p-8 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-2xl">
        <Card variant="glass" class="w-[400px]">
          <CardContent class="pt-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span class="text-lg font-semibold text-white">JD</span>
              </div>
              <div>
                <p class="font-semibold text-white">John Doe</p>
                <p class="text-sm text-white/70">CEO at Acme Inc.</p>
              </div>
            </div>
            <p class="text-white/90 leading-relaxed">
              "This product has completely transformed how we collect customer feedback.
              The AI-powered prompts make it incredibly easy for our customers to share their experiences."
            </p>
            <div class="mt-4 flex gap-1">
              <span class="text-yellow-300">★</span>
              <span class="text-yellow-300">★</span>
              <span class="text-yellow-300">★</span>
              <span class="text-yellow-300">★</span>
              <span class="text-yellow-300">★</span>
            </div>
          </CardContent>
        </Card>
      </div>
    `,
  }),
}

export const GlassDarkCard: Story = {
  render: () => ({
    components: { Card, CardContent },
    template: `
      <div class="p-8 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl">
        <Card variant="glass-dark" class="w-[400px]">
          <CardContent class="pt-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span class="text-lg font-semibold text-white">SM</span>
              </div>
              <div>
                <p class="font-semibold text-white">Sarah Miller</p>
                <p class="text-sm text-white/60">Founder at StartupXYZ</p>
              </div>
            </div>
            <p class="text-white/80 leading-relaxed">
              "The testimonial widgets integrate seamlessly with our website. Our conversion rate
              increased by 40% after adding the Wall of Love widget."
            </p>
          </CardContent>
        </Card>
      </div>
    `,
  }),
}

export const GlassTealCard: Story = {
  render: () => ({
    components: { Card, CardContent },
    template: `
      <div class="p-8 bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 rounded-2xl">
        <Card variant="glass-teal" class="w-[400px]">
          <CardContent class="pt-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-teal-500/30 backdrop-blur-sm flex items-center justify-center border border-teal-400/30">
                <span class="text-lg font-semibold text-white">MK</span>
              </div>
              <div>
                <p class="font-semibold text-white">Mike Kim</p>
                <p class="text-sm text-white/70">Product Manager</p>
              </div>
            </div>
            <p class="text-white/90 leading-relaxed">
              "Setting up the collection form took just 5 minutes. The smart prompts guide
              customers perfectly - we get detailed, authentic testimonials every time."
            </p>
          </CardContent>
        </Card>
      </div>
    `,
  }),
}

export const GlassCardGrid: Story = {
  render: () => ({
    components: { Card, CardContent },
    template: `
      <div class="p-8 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl">
        <div class="grid grid-cols-2 gap-4">
          <Card variant="glass" class="w-full">
            <CardContent class="pt-6">
              <p class="font-semibold text-white mb-2">Amazing product!</p>
              <p class="text-sm text-white/80">"Simple, effective, and beautiful."</p>
              <p class="text-xs text-white/60 mt-3">— Alex P.</p>
            </CardContent>
          </Card>
          <Card variant="glass" class="w-full">
            <CardContent class="pt-6">
              <p class="font-semibold text-white mb-2">Game changer</p>
              <p class="text-sm text-white/80">"Our customers love the guided prompts."</p>
              <p class="text-xs text-white/60 mt-3">— Jordan T.</p>
            </CardContent>
          </Card>
          <Card variant="glass" class="w-full">
            <CardContent class="pt-6">
              <p class="font-semibold text-white mb-2">Highly recommend</p>
              <p class="text-sm text-white/80">"Best testimonial tool we've used."</p>
              <p class="text-xs text-white/60 mt-3">— Sam R.</p>
            </CardContent>
          </Card>
          <Card variant="glass" class="w-full">
            <CardContent class="pt-6">
              <p class="font-semibold text-white mb-2">5 stars!</p>
              <p class="text-sm text-white/80">"Setup was a breeze."</p>
              <p class="text-xs text-white/60 mt-3">— Casey L.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    `,
  }),
}
