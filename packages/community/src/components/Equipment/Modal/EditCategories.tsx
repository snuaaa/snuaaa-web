import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { useModal } from 'contexts/modal';
import { FC, useContext, useState } from 'react';
import EditCategoryEntry from './EditCategoryEntry';
import EquipmentService from 'services/EquipmentService';

const EditCategoriesModal: FC = () => {
  const { closeModal } = useModal();
  const { categories, refreshCategories } = useContext(
    EquipmentCategoryContext,
  );

  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const onCategoryUpdate = async (id: number | null, name: string) => {
    //setEditCategoryId(id);
    if (id) await EquipmentService.updateCategory(id, name);
    else await EquipmentService.uploadCategory(name);
    setEditCategoryId(null);
    setIsCreating(false);
    refreshCategories();
  };

  const handleCategoryDelete = async (id: number) => {
    await EquipmentService.deleteCategory(id).catch((err) => {
      alert(
        '분류 삭제에 실패했습니다.\n해당 분류에 속하는 장비가 존재하는지 확인해 주세요.',
      );
    });
    refreshCategories();
  };

  return (
    <div className="fixed z-30 top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">
      <div className="absolute px-20 rounded-lg border border-gray-900 text-center bg-white z-40 py-5">
        <div>
          <button className="absolute top-0 right-0 m-2" onClick={closeModal}>
            <i className="ri-close-line text-3xl"></i>
          </button>
        </div>
        <h3 className="text-xl font-bold mt-4 mb-2">장비 분류 편집</h3>
        <div className="my-8">
          {categories.map((category) => {
            return editCategoryId === category.id ? (
              <div
                className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-56 py-1"
                key={category.id}
              >
                <EditCategoryEntry
                  defaultValue={category.name}
                  onFinish={(name) => onCategoryUpdate(category.id, name)}
                  onCancel={() => setEditCategoryId(null)}
                />
              </div>
            ) : (
              <div
                className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-56 py-1"
                key={category.id}
              >
                <div className="w-3/4">{category.name}</div>
                <div className="w-1/4 pr-1">
                  <button
                    onClick={() => {
                      if (!editCategoryId && !isCreating)
                        setEditCategoryId(category.id);
                    }}
                    disabled={editCategoryId != null || isCreating}
                  >
                    <i
                      className={
                        'ri-pencil-line text-lg ' +
                        (editCategoryId || isCreating
                          ? 'text-gray-400'
                          : 'text-gray-900')
                      }
                    ></i>
                  </button>
                  <button
                    onClick={() => {
                      if (!editCategoryId && !isCreating)
                        handleCategoryDelete(category.id);
                    }}
                    disabled={editCategoryId != null || isCreating}
                  >
                    <i
                      className={
                        'ri-delete-bin-line text-lg ' +
                        (editCategoryId || isCreating
                          ? 'text-gray-400'
                          : 'text-gray-900')
                      }
                    ></i>
                  </button>
                </div>
              </div>
            );
          })}
          {!isCreating ? (
            <button
              onClick={() => {
                if (!editCategoryId && !isCreating) setIsCreating(true);
              }}
              disabled={editCategoryId != null || isCreating}
              className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-56 py-1 justify-center"
            >
              <i
                className={
                  'ri-add-line text-lg ' +
                  (editCategoryId || isCreating
                    ? 'text-gray-400'
                    : 'text-gray-900')
                }
              ></i>
            </button>
          ) : (
            <div className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-56 py-1">
              <EditCategoryEntry
                defaultValue=""
                onFinish={(name) => onCategoryUpdate(null, name)}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCategoriesModal;
