type Props = {
  imgUrls: (string | undefined)[];
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
        const isSelectedImage = index === selectedImgIdx;
        return (
          <div key={index} className="block-constant">
            <div
              className="remove-icon-wrapper"
              onClick={() => removeImg(index)}
            >
              <i className="ri-close-circle-line cursor-pointer text-2xl"></i>
            </div>

            {imgUrl ? (
              <img
                className={`photo-thumbnail ${isSelectedImage ? 'selected' : 'default'}`}
                src={imgUrl}
                alt="thumbnail"
                onClick={() => onClickThumbnail(index)}
              />
            ) : (
              <div className="flex justify-center items-center h-full">
                <div className="spinner" />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default ThumbnailList;
