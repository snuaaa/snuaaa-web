import { Link } from '@tanstack/react-router';
import Image from '~/components/Common/AaaImage';
import defaultPhotoCover from '~/assets/img/default_photo_img.png';
import Pagination from '~/components/Common/Pagination';
import { usePhotoList } from '~/hooks/queries/usePhotoQueries';

type Props = {
  userUuid: string;
  page: number;
};

const PAGE_SIZE = 12;

const PhotoList = ({ userUuid, page }: Props) => {
  const { data } = usePhotoList({
    user_uuid: userUuid,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.count === 0) {
    return <div className="no-data">등록한 사진이 없습니다.</div>;
  }

  return (
    <div className="my-list-wrapper">
      <div className="photo-list-wrapper my-photo-list-wrapper">
        {data.rows.map((photo) => {
          const contentInfo = photo;
          const photoInfo = photo.photo;
          return (
            <div className="photo-wrapper" key={contentInfo.content_id}>
              <Link
                to="."
                search={(prev) => ({
                  ...prev,
                  photo: contentInfo.content_id,
                })}
              >
                <div className="photo-cover">
                  <i className="ri-heart-fill"></i> {contentInfo.like_num}&nbsp;
                  <i className="ri-message-2-fill"></i>{' '}
                  {contentInfo.comment_num}
                </div>
                {photoInfo && (
                  <Image
                    imgSrc={photoInfo.thumbnail_url}
                    defaultImgSrc={defaultPhotoCover}
                    local={false}
                  />
                )}
              </Link>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={page}
        totalPageCount={Math.ceil(data.count / PAGE_SIZE)}
      />
    </div>
  );
};

export default PhotoList;
