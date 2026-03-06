import ProfileMini from '~/components/Common/ProfileMini';
import { breakLine } from '~/utils/breakLine';
import { convertDate, convertFullDate } from '~/utils/convertDate';
import ActionDrawer from '~/components/Common/ActionDrawer';

import { ExhibitPhoto, Photo } from '~/services/types';

type PhotoInfoProps = {
  photoInfo: Photo | ExhibitPhoto;
  likeInfo: boolean;
  my_id: number;
  onClickEdit: () => void;
  deletePhoto: () => void;
  likePhoto: () => void;
  setAlbumThumbnail: () => void;
};

const PhotoInfo = ({
  photoInfo,
  likeInfo,
  my_id,
  onClickEdit,
  deletePhoto,
  likePhoto,
  setAlbumThumbnail,
}: PhotoInfoProps) => {
  const content = photoInfo;
  const photo = 'photo' in photoInfo ? photoInfo.photo : photoInfo.exhibitPhoto;
  const userInfo = photoInfo && photoInfo.user;
  const tagInfo = photoInfo && photoInfo.tags;

  return (
    <>
      {photoInfo && photo && (
        <div className="flex flex-col h-full">
          {/* ── Photo Info Content ── */}
          <div className="relative p-5 flex-1 overflow-auto">
            {userInfo && my_id === userInfo.user_id && (
              <ActionDrawer
                clickEdit={onClickEdit}
                clickDelete={deletePhoto}
                isPhoto={true}
                clickSetThumbnail={setAlbumThumbnail}
              />
            )}

            {/* Title & Date */}
            <div className="mb-3">
              <h4 className="text-xl font-bold text-primary-900 leading-tight font-[S-CoreDream-5Medium]">
                {content.title}
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                {convertFullDate(content.createdAt)}
              </p>
            </div>

            {/* Tags */}
            {tagInfo && tagInfo.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tagInfo.map((tag) => (
                  <span
                    key={tag.tag_id}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                      tag.tag_type === 'M' ? 'bg-red-500' : 'bg-primary-500'
                    }`}
                  >
                    # {tag.tag_name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {content.text && (
              <>
                <div className="h-px bg-gray-200 my-3" />
                <div className="text-sm text-gray-600 leading-relaxed max-h-[120px] overflow-auto">
                  {breakLine(content.text)}
                </div>
              </>
            )}

            {/* EXIF Metadata */}
            {photo &&
              (photo.date ||
                photo.location ||
                photo.camera ||
                photo.lens ||
                photo.exposure_time ||
                photo.iso) && (
                <>
                  <div className="h-px bg-gray-200 my-3" />
                  <div className="bg-white rounded-xl p-3 space-y-2 border border-gray-100 shadow-sm">
                    {photo.date && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <i className="ri-calendar-line text-primary-400 text-base w-5 text-center" />
                        <span className="text-gray-500 w-16 shrink-0">
                          Date
                        </span>
                        <span className="text-gray-800">
                          {convertDate(photo.date)}
                        </span>
                      </div>
                    )}
                    {photo.location && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <i className="ri-map-pin-line text-primary-400 text-base w-5 text-center" />
                        <span className="text-gray-500 w-16 shrink-0">
                          Location
                        </span>
                        <span className="text-gray-800">{photo.location}</span>
                      </div>
                    )}
                    {photo.camera && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <i className="ri-camera-line text-primary-400 text-base w-5 text-center" />
                        <span className="text-gray-500 w-16 shrink-0">
                          Camera
                        </span>
                        <span className="text-gray-800">{photo.camera}</span>
                      </div>
                    )}
                    {photo.lens && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <i className="ri-focus-2-line text-primary-400 text-base w-5 text-center" />
                        <span className="text-gray-500 w-16 shrink-0">
                          Lens
                        </span>
                        <span className="text-gray-800">
                          {photo.lens}
                          {photo.focal_length && ` @ ${photo.focal_length}mm`}
                        </span>
                      </div>
                    )}
                    {(photo.f_stop || photo.exposure_time || photo.iso) && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <i className="ri-settings-3-line text-primary-400 text-base w-5 text-center" />
                        <span className="text-gray-500 w-16 shrink-0">
                          Setting
                        </span>
                        <span className="text-gray-800">
                          {photo.f_stop && <>F/{photo.f_stop}</>}
                          {photo.exposure_time && <> {photo.exposure_time}</>}
                          {photo.iso && <> ISO{photo.iso}</>}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

            {/* Profile */}
            <div className="h-px bg-gray-200 my-3" />
            <ProfileMini userInfo={userInfo} />
            <div className="h-px bg-gray-200 my-3" />
          </div>

          {/* ── Stats Bar (sticky bottom) ── */}
          <div className="shrink-0 px-5 py-3 bg-white border-t border-gray-100">
            <div className="flex items-center text-sm">
              <div className="flex items-center gap-1 text-gray-400 mr-auto">
                <i className="ri-eye-fill text-lg" />
                <span>{content.view_num}</span>
              </div>
              <div className="flex items-center gap-1 text-pink-400 mr-3">
                <i
                  className={`${likeInfo ? 'ri-heart-fill' : 'ri-heart-line'} text-xl cursor-pointer hover:scale-110 transition-transform`}
                  onClick={() => likePhoto()}
                />
                <span>{content.like_num}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <i className="ri-message-2-fill text-lg" />
                <span>{content.comment_num}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoInfo;
