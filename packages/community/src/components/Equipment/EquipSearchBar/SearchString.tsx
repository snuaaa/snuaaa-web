import { ChangeEventHandler } from 'react';

type Props = {
  name: string;
  placeholder: string;
  value?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onEnter?: () => void;
};

const SearchString = ({
  name,
  placeholder,
  value,
  onChange,
  onEnter,
}: Props) => {
  return (
    <input
      name={name}
      type="text"
      className="border border-gray-300 text-gray-950 w-1/3 p-2"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnter) {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
          onEnter();
        }
      }}
    />
  );
};

export default SearchString;
