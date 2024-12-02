type Props = {
  imgUrls: string[];
  selectedImgIdx: number;
  onClickThumbnail: (idx: number) => void;
  removeImg: (idx: number) => void;
};

function ThumbnailList({
  imgUrls,
  selectedImgIdx,
  onClickThumbnail,
  removeImg,
}: Props) {
  return (
    <>
      {imgUrls.map((imgUrl, index) => {
        const imgClass =
          index === selectedImgIdx
            ? 'photo-thumbnail selected'
            : 'photo-thumbnail default';
        return (
          <div key={index} className="block-constant">
            <div
              className="remove-icon-wrapper"
              onClick={() => removeImg(index)}
            >
              <i className="ri-close-circle-line cursor-pointer text-2xl"></i>
            </div>
            <img
              className={imgClass}
              src={imgUrl}
              alt="thumbnail"
              onClick={() => onClickThumbnail(index)}
            />
          </div>
        );
      })}
    </>
  );
}

export default ThumbnailList;
