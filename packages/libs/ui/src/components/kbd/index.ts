import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Kbd } from "./Kbd.vue"

export const kbdVariants = cva(
  "inline-flex items-center justify-center rounded bg-muted font-mono text-muted-foreground text-center",
  {
    variants: {
      size: {
        default: "min-w-6 px-2 py-1 text-xs",
        sm: "min-w-5 px-1.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export type KbdVariants = VariantProps<typeof kbdVariants>
