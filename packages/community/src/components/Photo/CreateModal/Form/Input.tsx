import { InputHTMLAttributes } from 'react';
import { useFieldContext } from '../formContext';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<string>();
  return (
    <input
      {...props}
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  );
}
