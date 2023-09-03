import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Image from '../../components/Common/AaaImage';
import history from '../../common/history';
import PhotoType from '../../types/PhotoType';
import SpinningLoader from '../Common/SpinningLoader';

type PhotoListProps = {
    photos: PhotoType[];
}

const LIMIT_UNIT = 12;

const fakeFetch = (delay = 500) => new Promise(res => setTimeout(res, delay));

function PhotoList({ photos }: PhotoListProps) {

  const target = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState<number>(LIMIT_UNIT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect);
    if (target.current) {
      observer.observe(target.current);
    }
    return () => observer.disconnect();
  }, []);


  const onIntersect = async ([entry]: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    if (entry.isIntersecting) {
      setIsLoading(true);
      await fakeFetch();
      increaseLimit();
      setIsLoading(false);
    }
    else {
      setIsLoading(false);
    }
  };

  const increaseLimit = () => {
    setLimit(prevLimit => prevLimit + LIMIT_UNIT);
  };

  const makePhotoList = (photos: PhotoType[]) => {
    if (photos.length > 0) {
      return photos.map((content, index) => {
        const contentInfo = content;
        const photo = content.photo;
        if (index < limit) {
          return (
            <div className="photo-wrapper" key={contentInfo.content_id}>
              <Link to={{
                pathname: `/photo/${contentInfo.content_id}`,
                state: {
                  modal: true,
                  backgroundLocation: history.location
                }
              }} >
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
                <Image imgSrc={photo.thumbnail_path} />
              </Link>
            </div>
          );
        }
      });
    }
  };

  return (
    <>
      <div className="photo-list-wrapper">
        {makePhotoList(photos)}
      </div>
      <div className="photo-list-loader-wrapper" ref={target}>
        {
          isLoading && limit < photos.length &&
                    <SpinningLoader size={40} />
        }
      </div>
    </>
  );
}

export default PhotoList;