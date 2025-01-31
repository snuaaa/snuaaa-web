import React from 'react';

interface InputFieldProps {
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  placeholder,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="flex w-full mx-auto items-center">
      <div className="w-1/4">
        <label
          htmlFor={name}
          className="block font-bold text-gray-950 text-left pr-1"
        >
          {name}
          {required && <span className="text-red-600">*</span>}
        </label>
      </div>
      <div className="w-3/4">
        <input
          type="text"
          name={name}
          className="border border-gray-300 rounded m-2 p-1 w-full"
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InputField;
