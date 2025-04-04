import { useModal } from '~/contexts/modal';
import { ChangeEvent, FC, useState } from 'react';
import EquipmentService from '~/services/EquipmentService';
import { MyRent } from '~/services/types';
import UploadService from '~/services/UploadService';

type Props = {
  rent: MyRent;
  onSubmit: () => void;
};

const RentReturn: FC<Props> = ({ rent, onSubmit }) => {
  const { closeModal } = useModal();
  const [imgPath, setImgPath] = useState<string | undefined>();

  const handleClickSubmit = async () => {
    if (!imgPath) {
      alert('반납할 장비의 사진을 등록해주세요!');
      return;
    }
    try {
      await EquipmentService.returnEquipment(rent.id, imgPath);
      alert('반납이 완료되었습니다.');
    } catch (e) {
      alert('반납에 실패했습니다!');
      console.error(e);
    }
    onSubmit();
    closeModal();
  };

  const handleChangeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await UploadService.uploadImage(file, true);
    setImgPath(data.imgUrl);
  };

  const handleRemoveFile = () => {
    setImgPath(undefined);
  };

  return (
    <div className="relative px-20 rounded-lg text-center bg-white py-5">
      <div>
        <button className="absolute top-0 right-0 m-2" onClick={closeModal}>
          <i className="ri-close-line text-3xl"></i>
        </button>
      </div>
      <h3 className="text-2xl font-bold mt-4 mb-2">반납하기</h3>
      <h3 className="text-lg mt-4 mb-4">{rent.equipment.name}</h3>
      <div className="flex relative rounded-sm h-32 w-56 justify-center items-center mx-auto border-2 border-gray-300 border-dashed py-2 mt-2 mb-4">
        {imgPath ? (
          <>
            <div className="flex justify-center items-center">
              <img
                src={imgPath}
                alt="반납할 장비 사진"
                className="h-32 w-56 object-contain rounded-md"
              />
            </div>
            <button
              className="absolute top-0 right-0 w-6 h-6 flex justify-center items-center text-white bg-[#EF645D]"
              onClick={handleRemoveFile}
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </>
        ) : (
          <>
            <label
              htmlFor="input-img"
              className="w-full h-full cursor-pointer flex justify-center items-center"
            >
              <p className="text-gray-600 underline">사진 불러오기</p>
            </label>
            <input
              type="file"
              accept="image/*"
              id="input-img"
              className="hidden"
              onChange={handleChangeFile}
            />
          </>
        )}
      </div>
      <div className="flex w-full mx-auto items-center justify-center">
        <button
          className="text-base border border-gray-400 text-white text-center font-bold py-2 mx-2 mt-4 mb-2 bg-red-400 px-8"
          onClick={handleClickSubmit}
        >
          반납 완료
        </button>
      </div>
    </div>
  );
};

export default RentReturn;
