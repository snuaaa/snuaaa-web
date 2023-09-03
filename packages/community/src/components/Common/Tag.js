import React, { useState, useEffect } from 'react';

function Tag({ clickAll, clickTag, tags, selectedTags }) {

  const [selectedAll, setSelectedAll] = useState(false);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setSelectedAll(true);
    }
    else {
      setSelectedAll(false);
    }
  });

  const makeTagList = (tags, type) => {
    const tagList = tags
      .filter(tag => tag.tag_type === type)
      .map((tag) => {
        let labelClassName = (tag.tag_type === 'M') ? 'tag-label-1' : 'tag-label-2';

        return (
          <div className="tag-unit" key={tag.tag_id}>
            <input type="checkbox" id={tag.tag_id} checked={selectedTags.includes(tag.tag_id)}
              onChange={(e) => clickTag(e)} />
            <label className={labelClassName} htmlFor={tag.tag_id}>#{tag.tag_name}</label>
          </div>
        );
      });
    return tagList;
  };

  return (
    <div className="tag-wrapper">
      <div className="tag-list-wrapper">
        <div className="tag-unit tag-all">
          <input type="checkbox" id="all" checked={selectedAll}
            onChange={() => clickAll()} />
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
}

export default Tag;