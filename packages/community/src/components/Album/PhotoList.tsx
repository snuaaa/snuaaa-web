import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import Image from '../../components/Common/AaaImage';

import SpinningLoader from '../Common/SpinningLoader';
import { Photo } from '~/services/types';

type PhotoListProps = {
  photos: Photo[];
};

const LIMIT_UNIT = 12;

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

function PhotoList({ photos }: PhotoListProps) {
  const target = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState<number>(LIMIT_UNIT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onIntersect = useCallback(
    async ([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting) {
        setIsLoading(true);
        await fakeFetch();
        increaseLimit();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect);
    if (target.current) {
      observer.observe(target.current);
    }
    return () => observer.disconnect();
  }, [onIntersect]);

  const increaseLimit = () => {
    setLimit((prevLimit) => prevLimit + LIMIT_UNIT);
  };

  return (
    <>
      <div className="photo-list-wrapper">
        {photos.map((content, index) => {
          const contentInfo = content;
          const photo = content.photo;
          if (index < limit) {
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
                    <div className="photo-cover-unit">
                      <i className="ri-heart-fill"></i>
                      <p>{contentInfo.like_num}</p>
                    </div>
                    <div className="photo-cover-unit">
                      <i className="ri-message-2-fill"></i>
                      <p>{contentInfo.comment_num}</p>
                    </div>
                  </div>
                  <Image imgSrc={photo.thumbnail_url ?? photo.thumbnail_path} />
                </Link>
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="photo-list-loader-wrapper" ref={target}>
        {isLoading && limit < photos.length && <SpinningLoader size={40} />}
      </div>
    </>
  );
}

export default PhotoList;
