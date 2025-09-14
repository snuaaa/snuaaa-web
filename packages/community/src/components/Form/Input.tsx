import { InputHTMLAttributes, ReactNode } from 'react';
import { useFieldContext } from '../Form';

type Props = {
  iconClassName?: string;
  Adornment?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'className'
>;

export function Input({ iconClassName, Adornment, ...inputProps }: Props) {
  const field = useFieldContext<string>();
  return (
    <label className="flex relative mt-2 gap-2 w-full h-10 shrink-0 p-2 align-center bg-white border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-400">
      {iconClassName && (
        <i
          className={`${iconClassName} shrink-0 text-xl text-gray-500 flex items-center`}
        />
      )}
      <input
        {...inputProps}
        className="flex-grow text-sm text-gray-700 peer"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {Adornment ? Adornment : null}
      {inputProps.placeholder && (
        <span className="text-xs text-gray-500 top-0 -translate-y-1/2 absolute left-2 z-10 bg-white px-1">
          {inputProps.placeholder}
        </span>
      )}
    </label>
  );
}
