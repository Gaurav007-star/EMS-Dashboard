import * as React from 'react';
import { cn } from '../../lib/utils';

// ─── InputGroup ───────────────────────────────────────────────────────────────
// On focus: border darkens to primary + subtle inset shadow. No floating ring.
const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="input-group"
    className={cn(
      'flex items-stretch w-full overflow-hidden',
      'rounded-lg border border-border bg-transparent',
      'transition-[border-color,box-shadow] duration-150',
      'focus-within:border-foreground/40',
      'focus-within:[box-shadow:0_0_0_3px_color-mix(in_oklch,var(--primary)_12%,transparent)]',
      className
    )}
    {...props}
  />
));
InputGroup.displayName = 'InputGroup';

// ─── InputGroupAddon ─────────────────────────────────────────────────────────
interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'inline-start' | 'inline-end';
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = 'inline-start', ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        'flex items-center justify-center shrink-0 select-none px-3',
        'text-muted-foreground bg-muted/30',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        align === 'inline-start' && 'border-r border-border',
        align === 'inline-end'   && 'border-l border-border text-xs font-medium',
        className
      )}
      {...props}
    />
  )
);
InputGroupAddon.displayName = 'InputGroupAddon';

// ─── InputGroupInput ──────────────────────────────────────────────────────────
export interface InputGroupInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input-group-input"
      className={cn(
        'flex-1 min-w-0 h-10 bg-transparent px-3 py-2 text-sm text-foreground',
        'border-0 rounded-none outline-none ring-0 shadow-none',
        'placeholder:text-muted-foreground/60',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
InputGroupInput.displayName = 'InputGroupInput';

// ─── Input (standalone) ───────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2',
        'text-sm text-foreground',
        'transition-[border-color,box-shadow] duration-150',
        'placeholder:text-muted-foreground/60',
        'outline-none',
        'focus-visible:border-foreground/40',
        'focus-visible:[box-shadow:0_0_0_3px_color-mix(in_oklch,var(--primary)_12%,transparent)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input, InputGroup, InputGroupAddon, InputGroupInput };
