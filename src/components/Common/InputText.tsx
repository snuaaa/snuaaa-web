import React, { ChangeEvent } from 'react';

type Props = {
  name: string,
  className: string,
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void,
  placeholder: string,
  pattern?: string,
  isRequired: boolean,
}

const InputText: React.FC<Props> = ({ name, className, handleChange, placeholder, pattern, isRequired }: Props) => (
  <input
    type='text'
    name={name}
    className={className}
    onChange={handleChange}
    placeholder={placeholder}
    pattern={pattern}
    required={isRequired} />
);

export default InputText;