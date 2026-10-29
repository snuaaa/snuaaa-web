type Props<T extends number | string> = {
  name: string;
  options: readonly { value: T; name: string }[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
};

const Select = <T extends number | string>({
  name,
  options,
  value,
  onChange,
  required = true,
}: Props<T>) => {
  return (
    <div className="flex w-full mx-auto items-center">
      <div className="w-1/4">
        <label
          htmlFor={name}
          className="block font-bold text-fg text-left pr-1"
        >
          {name}
          <div className="text-danger inline">{required && '*'}</div>
        </label>
      </div>
      <div className="w-3/4">
        <select
          name={name}
          className="border border-gray-300 rounded-xs m-2 p-1 w-full bg-white text-fg"
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {options &&
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default Select;
