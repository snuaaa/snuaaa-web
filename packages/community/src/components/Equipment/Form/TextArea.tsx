import { ChangeEventHandler } from 'react';

type Props = {
  name: string;
  placeholder: string;
  value?: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  required?: boolean;
};

const InputField = ({
  name,
  placeholder,
  value,
  onChange,
  required = false,
}: Props) => {
  return (
    <div className="flex w-full mx-auto items-center">
      <div className="w-1/4">
        <label
          htmlFor={name}
          className="block font-bold text-gray-950 text-left pr-1"
        >
          {name}
          <div className="text-red-600 inline">{required && '*'}</div>
        </label>
      </div>
      <div className="w-3/4">
        <textarea
          name={name}
          className="border h-20 border-gray-300 rounded-xs m-2 p-1 w-full"
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default InputField;
