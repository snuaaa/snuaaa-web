import { useState, useEffect, ChangeEvent, FC } from 'react';
import { type Tag as TagType } from 'services/types';

type Props = {
  clickAll: () => void;
  clickTag: (event: ChangeEvent<HTMLInputElement>) => void;
  tags: TagType[];
  selectedTags: TagType['tag_id'][];
};

const Tag: FC<Props> = ({ clickAll, clickTag, tags, selectedTags }) => {
  const [selectedAll, setSelectedAll] = useState(false);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setSelectedAll(true);
    } else {
      setSelectedAll(false);
    }
  }, [selectedTags.length]);

  const makeTagList = (tags: TagType[], type: string) => {
    const tagList = tags
      .filter((tag) => tag.tag_type === type)
      .map((tag) => {
        const labelClassName =
          tag.tag_type === 'M' ? 'tag-label-1' : 'tag-label-2';

        return (
          <div className="tag-unit" key={tag.tag_id}>
            <input
              type="checkbox"
              id={tag.tag_id}
              checked={selectedTags.includes(tag.tag_id)}
              onChange={(e) => clickTag(e)}
            />
            <label className={labelClassName} htmlFor={tag.tag_id}>
              #{tag.tag_name}
            </label>
          </div>
        );
      });
    return tagList;
  };

  return (
    <div className="tag-wrapper">
      <div className="tag-list-wrapper">
        <div className="tag-unit tag-all">
          <input
            type="checkbox"
            id="all"
            checked={selectedAll}
            onChange={() => clickAll()}
          />
          <label htmlFor="all">ALL</label>
        </div>
        {makeTagList(tags, 'M')}
      </div>
      <div className="tag-list-wrapper">
        {/* <div className="tag-unit tag-all">
                    <input type="checkbox" id="all" checked={selectedAll}
                        onChange={() => clickAll()} />
                    <label htmlFor="all">ALL</label>
                </div> */}
        {makeTagList(tags, 'T')}
      </div>
    </div>
  );
};

export default Tag;
