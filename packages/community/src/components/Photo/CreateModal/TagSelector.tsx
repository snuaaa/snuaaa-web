import { ChangeEvent, FC } from 'react';
import { Tag } from 'services/types';

type Props = {
  tag: Tag;
  isSelected: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const TagSelector: FC<Props> = ({ tag, isSelected, onChange }) => {
  const labelClassName = tag.tag_type === 'M' ? 'tag-label-1' : 'tag-label-2';
  return (
    <div className="tag-unit" key={tag.tag_id}>
      <input
        type="checkbox"
        id={'crt_' + tag.tag_id}
        checked={isSelected}
        onChange={onChange}
      />
      <label className={labelClassName} htmlFor={'crt_' + tag.tag_id}>
        # {tag.tag_name}
      </label>
    </div>
  );
};
