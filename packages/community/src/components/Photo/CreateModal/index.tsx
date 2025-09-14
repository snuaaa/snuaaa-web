import { FC, FormEvent } from 'react';
import { Tag } from '~/services/types';
import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import useCreatePhoto from './useCreatePhoto';
import ThumbnailList from '~/components/Album/ThumbnailList';
import PreviewImage from '~/components/Album/PreviewImage';
import PhotoInfoForm from './Form';
import { TagSelector } from './TagSelector';
import { useStore } from '@tanstack/react-form';

type Props = {
  boardId: string;
  tags?: Tag[];
  albumId?: number;
  onCreatePhoto: () => void;
  onCancel: () => void;
};

const CreatePhoto: FC<Props> = ({
  boardId,
  tags,
  albumId,
  onCreatePhoto,
  onCancel,
}) => {
  useBlockBackgroundScroll();

  const {
    handleChangeTag,
    form,
    editingIdx,
    setEditingIdx,
    removeImg,
    handleChangeFile,
  } = useCreatePhoto({
    boardId,
    albumId,
    onCreatePhoto,
  });

  const thumbnailUrls = useStore(form.store, (state) =>
    state.values.list.map((info) => info.thumbnail_url),
  );

  const previewImgUrl = useStore(
    form.store,
    (state) => state.values.list[editingIdx]?.img_url,
  );

  const photoInfo = useStore(
    form.store,
    (state) => state.values.list[editingIdx],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <div className="crt-photo-popup">
      <form.AppForm>
        <form onSubmit={handleSubmit}>
          <div className="crt-photo-wrp">
            <div className="crt-photo-header">
              <h3>사진 업로드</h3>
            </div>
            <div className="crt-photo-body">
              <div className="crt-photo-left">
                <ThumbnailList
                  imgUrls={thumbnailUrls}
                  selectedImgIdx={editingIdx}
                  onClickThumbnail={setEditingIdx}
                  removeImg={removeImg}
                />
                <div className="block-constant">
                  <label htmlFor="photos">
                    <div className="add-photo">
                      <i className="ri-add-fill text-[2rem]"></i>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="photos"
                    multiple
                    accept="image/*"
                    onChange={handleChangeFile}
                  />
                </div>
              </div>

              <div className="crt-photo-center">
                <PreviewImage imgUrl={previewImgUrl} />
              </div>

              <div className="crt-photo-right">
                <div className="crt-photo-right-top">
                  {editingIdx >= 0 ? (
                    <>
                      {tags && (
                        <div className="tag-list-wrapper">
                          {tags.map((tag: Tag) => (
                            <TagSelector
                              key={tag.tag_id}
                              tag={tag}
                              isSelected={
                                photoInfo?.tags?.includes(tag.tag_id) ?? false
                              }
                              onChange={() => handleChangeTag(tag.tag_id)}
                            />
                          ))}
                        </div>
                      )}
                      <PhotoInfoForm form={form} editingIdx={editingIdx} />
                    </>
                  ) : (
                    <div className="message-info">사진을 선택해주세요</div>
                  )}
                </div>
                <div className="crt-photo-btn-wrapper">
                  <button className="btn-cancel" onClick={onCancel}>
                    취소
                  </button>
                  <button
                    className="btn-ok"
                    disabled={form.state.isSubmitting}
                    type="submit"
                  >
                    완료
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </form.AppForm>
    </div>
  );
};

export default CreatePhoto;
