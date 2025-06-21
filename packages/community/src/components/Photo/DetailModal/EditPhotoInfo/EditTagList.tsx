import { Tag } from '~/services/types';

type Props = {
  boardTagInfo: Tag[];
  selectedTags: Tag['tag_id'][];
  onChangeTag: (tagId: string) => void;
};

const EditTagList = ({ boardTagInfo, selectedTags, onChangeTag }: Props) => {
  return (
    <div className="tag-list-wrapper">
      {boardTagInfo.map((tag) => {
        const labelClassName =
          tag.tag_type === 'M' ? 'tag-label-1' : 'tag-label-2';
        return (
          <div className="tag-unit" key={tag.tag_id}>
            <input
              type="checkbox"
              id={'crt_' + tag.tag_id}
              checked={selectedTags ? selectedTags.includes(tag.tag_id) : false}
              onChange={() => onChangeTag(tag.tag_id)}
            />
            <label className={labelClassName} htmlFor={'crt_' + tag.tag_id}>
              # {tag.tag_name}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default EditTagList;
