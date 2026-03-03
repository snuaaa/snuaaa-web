import { useEquipmentCategories } from '~/hooks/queries/useEquipmentQueries';
import { ChangeEvent } from 'react';
import { Equipment } from '~/services/types';
import { equipmentStatusOptions } from '../common';
import InputField from './InputField';
import Select from './Select';
import UploadService from '~/services/UploadService';
import TextArea from './TextArea';

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
    | 'img_path'
  >;
  onChangeInput: (
    key: keyof Pick<
      Equipment,
      'name' | 'nickname' | 'location' | 'maker' | 'description' | 'img_path'
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
  const { data: categories = [] } = useEquipmentCategories();

  const categoryOptions =
    categories.map((category) => ({
      value: category.id,
      name: category.name,
    })) ?? [];

  const handleChangeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await UploadService.uploadImage(file, true);
    onChangeInput('img_path', data.imgUrl);
  };

  const handleRemoveFile = () => {
    onChangeInput('img_path', '');
  };

  return (
    <div className="relative px-20 rounded-lg text-center bg-white py-5">
      <div>
        <button
          className="absolute top-0 right-0 m-2"
          onClick={() => onCancel()}
        >
          <i className="ri-close-line text-3xl"></i>
        </button>
      </div>
      <h3 className="text-lg font-bold mt-2">{title}</h3>
      <div className="flex relative rounded-sm h-32 w-56 justify-center items-center mx-auto border-2 border-gray-300 border-dashed py-2 mt-2 mb-4">
        {equipment.img_path ? (
          <>
            <div className="flex justify-center items-center">
              <img
                src={equipment.img_path}
                alt="장비 이미지"
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
        <TextArea
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
  );
};

export default EquipmentForm;
