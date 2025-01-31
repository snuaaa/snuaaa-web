import React from 'react';

interface SelectProps<T extends number | string> {
  name: string;
  options: readonly { id: T; name: string }[] | null;
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
}

const SelectComponent = <T extends number | string>({
  name,
  options,
  value,
  onChange,
  required = true,
}: SelectProps<T>) => {
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
        <select
          name={name}
          className="border border-gray-300 rounded m-2 p-1 w-full bg-white text-gray-950"
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {options?.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectComponent;
