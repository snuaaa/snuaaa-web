import { useModal } from 'contexts/modal';
import { useFetch } from 'hooks/useFetch';
import { ChangeEvent, FC, useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import EquipmentService from 'services/EquipmentService';
import { Equipment, MyRent, PenaltyStatus } from 'services/types';
import UploadService from 'services/UploadService';
import { convertFullDate } from 'utils/convertDate';

type Props = {
  rent: MyRent;
  onSubmit: () => void;
};

const RentReturn: FC<Props> = ({ rent, onSubmit }) => {
  const { closeModal } = useModal();
  const [imgPath, setImgPath] = useState<string>('');

  const onClickSubmit = () => {
    if (!imgPath) {
      alert('반납할 장비의 사진을 등록해주세요!');
      return;
    }
    EquipmentService.returnEquipment(rent.id, imgPath).then((res) => {
      if (!res.data.result) alert('반납에 실패했습니다.');
      else alert('반납이 완료되었습니다.');
      onSubmit();
      closeModal();
    });
  };

  const handleChangeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await UploadService.uploadImage(file, true);
    setImgPath(data.imgUrl);
  };

  const handleRemoveFile = () => {
    setImgPath('');
  };

  return (
    <div className="fixed z-30 top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">
      <div className="absolute px-20 rounded-lg border border-gray-900 text-center bg-white z-40 py-5">
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
            onClick={onClickSubmit}
          >
            반납 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentReturn;
