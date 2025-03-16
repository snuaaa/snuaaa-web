import { ChangeEventHandler } from 'react';

type Props<T extends number | string> = {
  name: string;
  options: readonly { value: T; name: string }[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
  value: T;
  defaultOption?: string;
};

const SearchSelect = <T extends number | string>({
  name,
  options,
  onChange,
  value,
  defaultOption,
}: Props<T>) => {
  const defaultVal = typeof value === 'string' ? '' : 0;
  return (
    <select
      name={name}
      className={
        'border border-gray-300 bg-white p-2 ' +
        (value === defaultVal ? 'text-gray-500' : 'text-gray-950')
      }
      value={value}
      onChange={onChange}
    >
      {defaultOption && (
        <option key="ALL" value={defaultVal}>
          {defaultOption}
        </option>
      )}
      {options &&
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
    </select>
  );
};

export default SearchSelect;
