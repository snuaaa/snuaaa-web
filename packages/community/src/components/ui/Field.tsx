import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type AriaAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '~/lib/utils';

type FieldContextValue = {
  id: string;
  describedBy?: string;
  invalid: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

type FieldProps = {
  label: ReactNode;
  /** Shown under the input; replaces `hint` and marks the input invalid. */
  error?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  /** Defaults to a generated id. */
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * A label above an input and a message below it. The `Input` or `Textarea`
 * inside picks up the id, `aria-invalid` and `aria-describedby`.
 */
export function Field({
  label,
  error,
  hint,
  required,
  id: idProp,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const message = error ?? hint;
  const messageId = message ? `${id}-message` : undefined;

  return (
    <FieldContext.Provider
      value={{ id, describedBy: messageId, invalid: Boolean(error) }}
    >
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={id} className="text-label text-fg">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden>
              *
            </span>
          )}
        </label>
        {children}
        {message && (
          <p
            id={messageId}
            className={cn(
              'text-caption leading-snug',
              error ? 'text-danger' : 'text-fg-muted',
            )}
          >
            {message}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

// 16px text keeps iOS Safari from zooming in on focus.
const controlClassName =
  'w-full rounded-md border border-gray-300 bg-surface px-3 text-base text-fg placeholder:text-gray-400 transition-[border-color,box-shadow] focus:border-navy-700 focus:shadow-[0_0_0_3px_var(--color-navy-200)] focus:outline-none disabled:bg-surface-sunken disabled:text-gray-400 aria-invalid:border-danger aria-invalid:focus:shadow-[0_0_0_3px_var(--color-danger-soft)]';

type ControlProps = {
  id?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  'aria-describedby'?: string;
};

function useFieldProps(props: ControlProps): ControlProps {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field?.id,
    'aria-invalid': props['aria-invalid'] ?? (field?.invalid || undefined),
    'aria-describedby': props['aria-describedby'] ?? field?.describedBy,
  };
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(controlClassName, 'h-11', className)}
    {...props}
    {...useFieldProps(props)}
  />
));
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      controlClassName,
      'min-h-24 py-2.5 leading-normal',
      className,
    )}
    {...props}
    {...useFieldProps(props)}
  />
));
Textarea.displayName = 'Textarea';

/** A native select styled like `Input`, for short fixed lists (분류, 상태). */
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className={cn('relative', className)}>
    <select
      ref={ref}
      className={cn(controlClassName, 'h-11 appearance-none pr-9')}
      {...props}
      {...useFieldProps(props)}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
      aria-hidden
    />
  </div>
));
Select.displayName = 'Select';
