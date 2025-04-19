import { EquipmentCategoryContext } from '~/contexts/EquipmentCategoryContext';
import { useModal } from '~/contexts/modal';
import { useContext } from 'react';
import { Equipment } from '~/services/types';
import { equipmentStatusTextMap } from '../common';

type Props = {
  equipment: Equipment;
};

const EquipDescription: React.FC<Props> = ({ equipment }) => {
  const { categories } = useContext(EquipmentCategoryContext);
  const { closeModal } = useModal();

  return (
    <div className="relative px-10 rounded-lg text-center bg-white py-5">
      <div>
        <button className="absolute top-0 right-0 m-2" onClick={closeModal}>
          <i className="ri-close-line text-3xl"></i>
        </button>
      </div>
      <h3 className="text-2xl font-bold mt-4 mb-2">장비 상세 정보</h3>
      <h3 className="text-lg font-bold mt-4 mb-4">{equipment.name}</h3>
      <div className="flex justify-center items-center my-2">
        <img
          src={equipment.img_path}
          alt="장비 사진"
          className="h-32 w-56 object-contain rounded-md"
        />
      </div>
      <div className="relative overflow-x-auto mt-4">
        <table className="w-full text-sm text-left border text-gray-700 dark:text-gray-400">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              장비명
            </th>
            <td className="px-6 py-2">{equipment.name}</td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              분류
            </th>
            <td className="px-6 py-2">
              {
                categories.find(
                  (category) => category.id === equipment.category_id,
                )?.name
              }
            </td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              상태
            </th>
            <td className="px-6 py-2">
              {equipmentStatusTextMap[equipment.status]}
            </td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              위치
            </th>
            <td className="px-6 py-2">{equipment.location}</td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              제조사
            </th>
            <td className="px-6 py-2">{equipment.maker}</td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              별명
            </th>
            <td className="px-6 py-2">{equipment.nickname}</td>
          </tr>
        </table>
      </div>
      <h3 className="text-lg mt-4 mb-4 font-bold">추가 설명</h3>
      <div className="w-80 border border-gray-400 mx-auto max-h-40 px-4 py-2 rounded-sm text-wrap mb-4 text-left text-sm/5 whitespace-pre-wrap overflow-y-auto">
        {equipment.description}
      </div>
    </div>
  );
};

export default EquipDescription;
