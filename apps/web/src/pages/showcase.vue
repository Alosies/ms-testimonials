<script setup lang="ts">
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@testimonials/ui'
import { ref } from 'vue'

defineOptions({
  name: 'ShowcasePage',
})

const email = ref('')
const message = ref('')
const agreed = ref(false)
const notifications = ref(true)
const selectedPlan = ref('')
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b">
      <div class="container mx-auto flex items-center justify-between px-4 py-4">
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-lg bg-primary" />
          <span class="text-xl font-bold">Testimonials</span>
        </div>
        <nav class="flex items-center gap-4">
          <Button variant="ghost" as="a" href="/">Home</Button>
          <Button variant="ghost">Features</Button>
          <Button variant="ghost">Pricing</Button>
          <Button>Get Started</Button>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 py-12">
      <!-- Hero -->
      <section class="mb-16 text-center">
        <Badge class="mb-4">Component Showcase</Badge>
        <h1 class="mb-4 text-5xl font-bold tracking-tight">
          Shadcn-Vue Components
        </h1>
        <p class="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          A preview of all the UI components available in the @testimonials/ui package.
        </p>
      </section>

      <Separator class="my-12" />

      <!-- Component Showcase -->
      <section class="mb-16">
        <Tabs default-value="cards" class="mx-auto max-w-4xl">
          <TabsList class="grid w-full grid-cols-4">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="data">Data Display</TabsTrigger>
          </TabsList>

          <!-- Cards Tab -->
          <TabsContent value="cards" class="mt-6">
            <div class="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent>
                  <div class="text-3xl font-bold">$0</div>
                  <p class="text-muted-foreground">per month</p>
                </CardContent>
                <CardFooter>
                  <Button class="w-full" variant="outline">Get Started</Button>
                </CardFooter>
              </Card>

              <Card class="border-primary">
                <CardHeader>
                  <div class="flex items-center justify-between">
                    <CardTitle>Pro Plan</CardTitle>
                    <Badge>Popular</Badge>
                  </div>
                  <CardDescription>For growing businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div class="text-3xl font-bold">$29</div>
                  <p class="text-muted-foreground">per month</p>
                </CardContent>
                <CardFooter>
                  <Button class="w-full">Subscribe</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For large organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div class="text-3xl font-bold">Custom</div>
                  <p class="text-muted-foreground">contact sales</p>
                </CardContent>
                <CardFooter>
                  <Button class="w-full" variant="outline">Contact Us</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <!-- Forms Tab -->
          <TabsContent value="forms" class="mt-6">
            <Card class="mx-auto max-w-md">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>Send us a message and we'll get back to you.</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <Label for="email">Email</Label>
                  <Input id="email" v-model="email" type="email" placeholder="you@example.com" />
                </div>

                <div class="space-y-2">
                  <Label for="plan">Select Plan</Label>
                  <Select v-model="selectedPlan">
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label for="message">Message</Label>
                  <Textarea
                    id="message"
                    v-model="message"
                    placeholder="Tell us how we can help..."
                    rows="4"
                  />
                </div>

                <div class="flex items-center space-x-2">
                  <Checkbox id="terms" v-model:checked="agreed" />
                  <Label for="terms" class="text-sm">I agree to the terms and conditions</Label>
                </div>

                <div class="flex items-center justify-between">
                  <Label for="notifications">Email notifications</Label>
                  <Switch id="notifications" v-model:checked="notifications" />
                </div>
              </CardContent>
              <CardFooter>
                <Button class="w-full" :disabled="!agreed">Send Message</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <!-- Feedback Tab -->
          <TabsContent value="feedback" class="mt-6">
            <div class="mx-auto max-w-md space-y-6">
              <Card>
                <CardContent class="pt-6">
                  <div class="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">Sarah Johnson</p>
                      <p class="text-sm text-muted-foreground">Product Manager at Acme</p>
                    </div>
                  </div>
                  <p class="mt-4 text-muted-foreground">
                    "This tool has completely transformed how we collect customer feedback.
                    The AI-powered prompts are incredibly helpful!"
                  </p>
                </CardContent>
              </Card>

              <div class="flex justify-center">
                <Dialog>
                  <DialogTrigger as-child>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Testimonial</DialogTitle>
                      <DialogDescription>
                        Share your experience with our product.
                      </DialogDescription>
                    </DialogHeader>
                    <div class="space-y-4 py-4">
                      <div class="space-y-2">
                        <Label>Your feedback</Label>
                        <Textarea placeholder="Tell us about your experience..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Submit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </TabsContent>

          <!-- Data Display Tab -->
          <TabsContent value="data" class="mt-6">
            <div class="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Loading States</CardTitle>
                  <CardDescription>Skeleton components for loading</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="flex items-center gap-4">
                    <Skeleton class="size-12 rounded-full" />
                    <div class="space-y-2">
                      <Skeleton class="h-4 w-32" />
                      <Skeleton class="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton class="h-20 w-full" />
                  <div class="flex gap-2">
                    <Skeleton class="h-8 w-20" />
                    <Skeleton class="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Badges & Avatars</CardTitle>
                  <CardDescription>Status indicators and user avatars</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                  <Separator />
                  <div class="flex -space-x-2">
                    <Avatar class="border-2 border-background">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar class="border-2 border-background">
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <Avatar class="border-2 border-background">
                      <AvatarFallback>CD</AvatarFallback>
                    </Avatar>
                    <Avatar class="border-2 border-background">
                      <AvatarFallback>+5</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Separator class="my-12" />

      <!-- Button Variants -->
      <section class="mb-16">
        <h2 class="mb-8 text-center text-3xl font-bold">Button Variants</h2>
        <div class="flex flex-wrap justify-center gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div class="mt-4 flex flex-wrap justify-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t bg-muted/50">
      <div class="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>Built with Shadcn-Vue, Tailwind CSS, and Vue 3</p>
      </div>
    </footer>
  </div>
</template>
