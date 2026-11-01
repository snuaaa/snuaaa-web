import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cn } from '~/lib/utils';

/** Underlined tabs (전체 / 공지 / 자유 …). */
export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex gap-5 overflow-x-auto border-b border-border [scrollbar-width:none]',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      '-mb-px flex min-h-11 shrink-0 items-center border-b-2 border-transparent text-sm font-medium whitespace-nowrap text-fg-muted transition-colors hover:text-fg data-[state=active]:border-primary data-[state=active]:font-bold data-[state=active]:text-primary',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = TabsPrimitive.Content;

type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
  'aria-label': string;
  className?: string;
};

/** Pill-shaped switch between a few views (사진 / 앨범 …). */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      // Radix sends '' when the active item is pressed again; keep it selected.
      onValueChange={(next) => next && onValueChange(next as T)}
      className={cn(
        'inline-flex w-fit rounded-full bg-surface-sunken p-1',
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <ToggleGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className="h-9 rounded-full px-4 text-label text-fg-muted transition-colors hover:text-fg data-[state=on]:bg-surface data-[state=on]:text-fg data-[state=on]:shadow-sm"
        >
          {option.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
