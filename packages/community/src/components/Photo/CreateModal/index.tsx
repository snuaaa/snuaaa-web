import { FC, useCallback } from 'react';
import { Tag } from 'services/types';
import useBlockBackgroundScroll from 'hooks/useBlockBackgroundScroll';
import useCreatePhoto from './useCreatePhoto';
import ThumbnailList from 'components/Album/ThumbnailList';
import PreviewImage from 'components/Album/PreviewImage';
import PhotoInfoForm from './PhotoInfoForm';
import { TagSelector } from './TagSelector';

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
    photoInfo,
    uploadPhotos,
    handleChangeTag,
    handleDate,
    handleChange,
    createPhotos,
    editingIdx,
    setEditingIdx,
    imgUrls,
    removeImg,
    uploadFile,
    isCreating,
  } = useCreatePhoto({
    boardId,
    albumId,
    onCreatePhoto,
  });

  const handleClickCreate = useCallback(() => {
    if (!uploadPhotos) {
      alert('사진을 첨부해주세요');
      return;
    }
    createPhotos();
  }, [createPhotos, uploadPhotos]);

  const selectedPhotoInfo = photoInfo?.get(editingIdx);

  return (
    <div className="crt-photo-popup">
      <div className="crt-photo-wrp">
        <div className="crt-photo-header">
          <h3>사진 업로드</h3>
        </div>
        <div className="crt-photo-body">
          <div className="crt-photo-left">
            <ThumbnailList
              imgUrls={imgUrls}
              selectedImgIdx={editingIdx}
              onClickThumbnail={setEditingIdx}
              removeImg={removeImg}
            />
            <div className="block-constant">
              <label htmlFor="photos">
                <div className="add-photo">
                  <i className="ri-add-fill enif-f-2x"></i>
                </div>
              </label>
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={uploadFile}
              />
            </div>
          </div>

          <div className="crt-photo-center">
            <PreviewImage imgUrl={imgUrls[editingIdx]} />
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
                            photoInfo
                              ?.get(editingIdx)
                              ?.tags?.includes(tag.tag_id) ?? false
                          }
                          onChange={() => handleChangeTag(tag.tag_id)}
                        />
                      ))}
                    </div>
                  )}
                  {selectedPhotoInfo && (
                    <PhotoInfoForm
                      photoInfo={selectedPhotoInfo}
                      handleChange={handleChange}
                      handleDate={handleDate}
                    />
                  )}
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
                disabled={isCreating}
                onClick={handleClickCreate}
              >
                완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePhoto;
