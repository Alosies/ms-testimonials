export interface IconProps {
  /** Icon name in format "collection:icon-name" (e.g., "heroicons:home") */
  icon: string
  /** Icon color - accepts any CSS color value */
  color?: string
  /** Icon width in pixels or CSS unit */
  width?: number | string
  /** Icon height in pixels or CSS unit */
  height?: number | string
  /** Flip icon horizontally */
  hFlip?: boolean
  /** Flip icon vertically */
  vFlip?: boolean
  /** Rotate icon (0, 1, 2, 3 for 0°, 90°, 180°, 270°) */
  rotate?: 0 | 1 | 2 | 3
  /** Inline mode - icon behaves as inline element */
  inline?: boolean
}

export interface IconButtonProps {
  /** Icon name in format "collection:icon-name" */
  icon: string
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Accessible label for screen readers */
  ariaLabel?: string
  /** Whether the button is disabled */
  disabled?: boolean
}
