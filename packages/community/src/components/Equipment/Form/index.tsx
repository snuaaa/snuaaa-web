import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { useContext } from 'react';
import { Equipment } from 'services/types';
import { equipmentStatusOptions } from '../common';
import InputField from './InputField';
import Select from './Select';

type Props = {
  title: string;
  submitText: string;
  equipment: Pick<
    Equipment,
    | 'name'
    | 'nickname'
    | 'category_id'
    | 'status'
    | 'location'
    | 'maker'
    | 'description'
  >;
  onChangeInput: (
    key: keyof Pick<
      Equipment,
      'name' | 'nickname' | 'location' | 'maker' | 'description'
    >,
    value: string,
  ) => void;
  onChangeSelect: (
    key: keyof Pick<Equipment, 'category_id' | 'status'>,
    value: Equipment[keyof Pick<Equipment, 'category_id' | 'status'>],
  ) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onCancel: () => void;
};

// Modal to create or edit equipment
const EquipmentForm: React.FC<Props> = ({
  title,
  submitText,
  equipment,
  onChangeInput,
  onChangeSelect,
  onSubmit,
  onCancel,
  onDelete,
}) => {
  //useBlockBackgroundScroll();
  const { categories } = useContext(EquipmentCategoryContext);
  // const imgPath = 'https://placehold.co/600x400';

  const categoryOptions =
    categories.map((category) => ({
      value: category.id,
      name: category.name,
    })) ?? [];

  return (
    <div className="fixed z-30 top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">
      <div className="absolute px-20 rounded-lg border border-gray-900 text-center bg-white z-99 py-5">
        <div>
          <button
            className="absolute top-0 right-0 m-2"
            onClick={() => onCancel()}
          >
            <i className="ri-close-line text-3xl"></i>
          </button>
        </div>
        <h3 className="text-lg font-bold mt-2">{title}</h3>
        <div className="rounded-sm h-30 w-56 justify-center align-center mx-auto border border-2 border-gray-300 border-dashed py-2 mt-2 mb-4">
          <img
            className="h-20 mx-auto m-2"
            src="https://placehold.co/600x400"
            alt="장비 이미지"
          />
          <div className="text-gray-600 ul">
            <u>사진 불러오기</u>
          </div>
        </div>
        <div className="w-56 mx-auto text-xs">
          <InputField
            name="장비명"
            placeholder="장비명을 입력하세요."
            value={equipment.name}
            onChange={(e) => onChangeInput('name', e.target.value)}
            required
          />

          <Select
            name="분류"
            options={categoryOptions}
            value={equipment.category_id}
            onChange={(value) => onChangeSelect('category_id', value)}
          />
          <Select
            name="상태"
            options={equipmentStatusOptions}
            value={equipment.status}
            onChange={(value) => onChangeSelect('status', value)}
          />

          <InputField
            name="위치"
            placeholder="위치를 입력하세요."
            value={equipment.location}
            onChange={(e) => onChangeInput('location', e.target.value)}
            required
          />
          <InputField
            name="제조사"
            placeholder="제조사를 입력하세요."
            value={equipment.maker}
            onChange={(e) => onChangeInput('maker', e.target.value)}
            required
          />

          <InputField
            name="별명"
            placeholder="별명을 입력하세요."
            value={equipment.nickname}
            onChange={(e) => onChangeInput('nickname', e.target.value)}
          />
          <InputField
            name="추가 설명"
            placeholder="선택 입력"
            value={equipment.description}
            onChange={(e) => onChangeInput('description', e.target.value)}
          />
          <div className="flex w-full mx-auto items-center justify-center">
            <button
              className="text-base border border-gray-400 text-white text-center font-bold py-2 mx-2 mt-4 mb-2 bg-gray-400 px-8"
              onClick={onSubmit}
            >
              {submitText}
            </button>
          </div>
          {onDelete && (
            <div className="flex w-full mx-auto items-center justify-center">
              <button
                className="text-base border border-red-500 text-red-500 text-center font-bold py-2 mx-2 mb-4 mt-2 px-8"
                onClick={onDelete}
              >
                장비 삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentForm;
