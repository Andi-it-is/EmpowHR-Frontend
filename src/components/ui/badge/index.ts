import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Badge } from "./Badge.vue"

export const badgeVariants = cva(
  "inline-flex gap-1 items-center rounded-md border h-fit px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/30 text-red-900 dark:text-red-100 hover:dark:text-white hover:text-black hover:bg-destructive/50",
        warning:
          "border-transparent bg-warning text-black shadow hover:bg-warning/80",
        positive:
          "border-transparent bg-positive/30 text-emerald-900 dark:text-emerald-100 hover:dark:text-white hover:text-black hover:bg-positive/50",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
