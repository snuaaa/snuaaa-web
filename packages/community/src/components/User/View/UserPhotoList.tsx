import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Image from '~/components/Common/AaaImage';
import history from '~/common/history';
import defaultPhotoCover from '~/assets/img/default_photo_img.png';
import { useFetch } from '~/hooks/useFetch';
import useQueryString from '~/hooks/useQueryString';
import Pagination from '~/components/Common/Pagination';
import PhotoService from '~/services/PhotoService';

type Props = {
  userUuid: string;
};

const PAGE_SIZE = 12;

const PhotoList = ({ userUuid }: Props) => {
  const location = useLocation();

  const queryString = useQueryString();
  const page = Number(queryString.get('page') ?? 1);

  const fetchFunction = useCallback(() => {
    return PhotoService.retrievePhotoList({
      user_uuid: userUuid,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
  }, [userUuid, page]);

  const { data } = useFetch({
    fetch: fetchFunction,
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
                to={{
                  pathname: `/photo/${contentInfo.content_id}`,
                  state: {
                    modal: true,
                    backgroundLocation: history.location,
                  },
                }}
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
        routeGenerator={(page) => {
          const nextSearchParam = new URLSearchParams(queryString);
          nextSearchParam.set('page', page.toString());
          return `${location.pathname}?${nextSearchParam.toString()}`;
        }}
      />
    </div>
  );
};

export default PhotoList;
