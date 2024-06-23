import { ChangeEvent, FocusEvent } from 'react';

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  valid?: boolean | null;
  placeholder?: string;
  pattern?: string;
  disabled?: boolean;
  maxLength?: number;
  required?: boolean;
  invalidMessage?: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur?: (e: FocusEvent<HTMLInputElement>) => void;
};

const InputField = ({
  label,
  name,
  type,
  value,
  valid,
  placeholder,
  pattern,
  disabled,
  maxLength,
  required,
  invalidMessage,
  handleChange,
  handleBlur,
}: InputFieldProps) => {
  const fieldClass = `mx-auto mt-4 w-[400px] bg-white rounded-[20px] p-2 text-sm 
  ${valid !== undefined ? 'border-2 border-solid' : ''}
  ${valid === true ? 'border-blue-500' : valid === false ? 'border-red-500' : ''}`;

  return (
    <div className={fieldClass}>
      <label
        htmlFor={name}
        className="inline-block w-2/5 text-sm font-bold m-1 text-gray-600"
      >
        {label}
      </label>
      <input
        // ref={this.inputRef}
        type={type || 'text'}
        id={name}
        name={name}
        className="h-8 inline-block w-11/20"
        onChange={(e) => {
          handleChange(e);
        }}
        onBlur={(e) => {
          if (handleBlur) {
            handleBlur(e);
          }
        }}
        value={value}
        placeholder={placeholder}
        pattern={pattern}
        disabled={disabled}
        maxLength={maxLength ? maxLength : 20}
        required={required}
      />
      {valid === false && (
        <p className="text-right text-xs text-red-500">{invalidMessage}</p>
      )}
    </div>
  );
};

export default InputField;
