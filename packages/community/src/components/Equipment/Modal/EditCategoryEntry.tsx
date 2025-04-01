import { ChangeEvent, FC, useCallback, useState } from 'react';

type Props = {
  defaultValue: string;
  onFinish: (name: string) => void;
  onCancel: () => void;
};

const EditCategoryEntry: FC<Props> = ({ defaultValue, onFinish, onCancel }) => {
  const [name, setName] = useState(defaultValue);
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    [],
  );
  return (
    <>
      <input
        type="text"
        className="w-3/4 text-center"
        defaultValue={defaultValue}
        autoFocus
        onChange={onChange}
        onKeyDown={(e) => {
          if(e.key === 'Enter') onFinish(name);
        }}
        value={name}
      />
      <div className="w-1/4 pr-1">
        <button onClick={() => onFinish(name)}>
          <i className="ri-check-line text-lg text-green-500"></i>
        </button>
        <button onClick={onCancel}>
          <i className="ri-close-line text-lg text-red-500"></i>
        </button>
      </div>
    </>
  );
};

export default EditCategoryEntry;
