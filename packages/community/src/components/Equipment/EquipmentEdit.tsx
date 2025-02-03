import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { useContext, useState } from 'react';
import EquipmentService, {
  EquipmentUploadRequest,
} from 'services/EquipmentService';
import { Equipment, EquipmentStatus } from 'services/types';
import { equipmentStatusOptions } from './common';

export type EditModalInfo = {
  isModalOpen: boolean;
  equipment: Equipment | undefined;
};

type Props = {
  editModalInfo: EditModalInfo;
  onFinishEdit: () => void;
  onCancel: () => void;
};

// Modal to create or edit equipment
const EquipmentEdit: React.FC<Props> = ({
  editModalInfo,
  onFinishEdit,
  onCancel,
}) => {
  //useBlockBackgroundScroll();
  const categories = useContext(EquipmentCategoryContext);
  const [name, setName] = useState(editModalInfo.equipment?.name ?? '');
  const [categoryId, setCategoryId] = useState(
    editModalInfo.equipment?.category_id ?? 1,
  );
  const [status, setStatus] = useState(
    editModalInfo.equipment?.status ?? EquipmentStatus.OK,
  );
  const [location, setLocation] = useState(
    editModalInfo.equipment?.location ?? '',
  );
  const [maker, setMaker] = useState(editModalInfo.equipment?.maker ?? '');
  const [description, setDescription] = useState(
    editModalInfo.equipment?.description ?? '',
  );
  const imgPath = 'https://placehold.co/600x400';

  const createSelect = <T extends number | string>(
    name: string,
    options: readonly { id: T; name: string }[] | null,
    state: T,
    callback: (value: T) => void,
    required = true,
  ) => {
    return (
      <div className="flex w-full mx-auto items-center">
        <div className="w-1/4">
          <label
            htmlFor={name}
            className="block font-bold text-gray-950 text-left pr-1"
          >
            {name}
            <div className="text-red-600 inline">{required && '*'}</div>
          </label>
        </div>
        <div className="w-3/4">
          <select
            name={name}
            className="border border-gray-300 rounded-xs m-2 p-1 w-full bg-white text-gray-950"
            value={state}
            onChange={(e) => callback(e.target.value as T)}
          >
            {options &&
              options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
          </select>
        </div>
      </div>
    );
  };

  const createInputField = (
    name: string,
    placeholder: string,
    state: string,
    callback: (value: string) => void,
    required = false,
  ) => {
    return (
      <div className="flex w-full mx-auto items-center">
        <div className="w-1/4">
          <label
            htmlFor={name}
            className="block font-bold text-gray-950 text-left pr-1"
          >
            {name}
            <div className="text-red-600 inline">{required && '*'}</div>
          </label>
        </div>
        <div className="w-3/4">
          <input
            type="text"
            name={name}
            className="border border-gray-300 rounded-xs m-2 p-1 w-full"
            placeholder={placeholder}
            required={required}
            value={state}
            onChange={(e) => callback(e.target.value)}
          />
        </div>
      </div>
    );
  };

  const createCategorySelect = () => {
    return createSelect('분류', categories, categoryId, setCategoryId);
  };

  const createStatusSelect = () => {
    return createSelect('상태', equipmentStatusOptions, status, setStatus);
  };

  const handleSubmit = async () => {
    const data: EquipmentUploadRequest = {
      id: editModalInfo.equipment?.id,
      name: name,
      category_id: categoryId,
      status: status,
      location: location,
      maker: maker,
      description: description,
      img_path: imgPath,
    };
    await EquipmentService.uploadEquipment(data);
  };

  const deleteEquipment = async () => {
    if (editModalInfo.equipment) {
      await EquipmentService.deleteEquipment(editModalInfo.equipment.id);
    }
  };

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
        <h3 className="text-lg font-bold mt-2">
          {editModalInfo.equipment ? '장비 정보 수정' : '새 장비 등록'}
        </h3>
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
          {createInputField(
            '장비명',
            '장비명을 입력하세요.',
            name,
            setName,
            true,
          )}
          {createCategorySelect()}
          {createStatusSelect()}
          {createInputField(
            '위치',
            '위치를 입력하세요.',
            location,
            setLocation,
            true,
          )}
          {createInputField(
            '제조사',
            '제조사를 입력하세요.',
            maker,
            setMaker,
            true,
          )}
          {/*TODO: 기증자 필드 추가해야 할까요?*/}
          {createInputField(
            '추가 설명',
            '선택 입력',
            description,
            setDescription,
            false,
          )}
          <div className="flex w-full mx-auto items-center justify-center">
            <button
              className="text-base border border-gray-400 text-white text-center font-bold py-2 mx-2 mt-4 mb-2 bg-gray-400 px-8"
              onClick={async () => {
                await handleSubmit();
                onFinishEdit();
              }}
            >
              {editModalInfo.equipment ? '수정 완료' : '장비 등록하기'}
            </button>
          </div>
          {editModalInfo.equipment && (
            <div className="flex w-full mx-auto items-center justify-center">
              <button
                className="text-base border border-red-500 text-red-500 text-center font-bold py-2 mx-2 mb-4 mt-2 px-8"
                onClick={async () => {
                  const goDrop = window.confirm('정말로 삭제하시겠습니까?');
                  if (!goDrop) return;
                  await deleteEquipment();
                  onFinishEdit();
                }}
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

export default EquipmentEdit;
