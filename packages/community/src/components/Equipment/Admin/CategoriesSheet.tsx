import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Button, Input, Sheet } from '~/components/ui';
import {
  useCreateCategory,
  useDeleteCategory,
  useEquipmentCategories,
  useEquipmentList,
  useUpdateCategory,
} from '~/hooks/queries/useEquipmentQueries';
import { EquipmentCategory } from '~/services/types';

type CategoriesSheetProps = {
  open: boolean;
  onClose: () => void;
};

/** The row being renamed, or 'new' for 분류 추가. */
type Editing = { id: number | 'new'; name: string } | null;

/** 장비 분류 편집: rename, add, and delete empty categories. */
export default function CategoriesSheet({
  open,
  onClose,
}: CategoriesSheetProps) {
  const { data: categories = [] } = useEquipmentCategories();
  const { data: equipments } = useEquipmentList();
  const { mutateAsync: create, isPending: creating } = useCreateCategory();
  const { mutateAsync: rename, isPending: renaming } = useUpdateCategory();
  const { mutateAsync: remove } = useDeleteCategory();
  const [editing, setEditing] = useState<Editing>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setEditing(null);
    setError(null);
    onClose();
  };

  const save = async () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return;
    setError(null);
    try {
      if (editing.id === 'new') await create(name);
      else await rename({ id: editing.id, name });
      setEditing(null);
    } catch (err) {
      console.error(err);
      setError('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const del = async (category: EquipmentCategory) => {
    setError(null);
    const used = equipments?.equipInfo.some(
      (equip) => equip.category_id === category.id,
    );
    if (used) {
      setError(
        `${category.name}에 장비가 남아 있어 지울 수 없어요. 장비의 분류를 먼저 바꿔 주세요.`,
      );
      return;
    }
    try {
      await remove(category.id);
    } catch (err) {
      console.error(err);
      setError(`${category.name} 분류를 지우지 못했어요.`);
    }
  };

  const editor = (
    <div className="flex h-[52px] items-center gap-2 border-b border-gray-100 px-1">
      <Input
        aria-label="분류 이름"
        autoFocus
        value={editing?.name ?? ''}
        onChange={(e) =>
          setEditing((prev) => prev && { ...prev, name: e.target.value })
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') {
            e.stopPropagation();
            setEditing(null);
          }
        }}
        className="h-[38px] flex-1"
      />
      <Button
        size="sm"
        onClick={save}
        loading={creating || renaming}
        disabled={!editing?.name.trim()}
      >
        저장
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setEditing(null)}
        className="text-fg-muted"
      >
        취소
      </Button>
    </div>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && close()}
      title="장비 분류 편집"
      footer={
        <Button
          variant="secondary"
          block
          onClick={close}
          className="h-[52px] rounded-lg text-[15px] md:h-10"
        >
          닫기
        </Button>
      }
    >
      <div className="flex flex-col pb-2 md:px-2">
        <ul>
          {categories.map((category) =>
            editing?.id === category.id ? (
              <li key={category.id}>{editor}</li>
            ) : (
              <li
                key={category.id}
                className="flex h-[52px] items-center gap-1 border-b border-gray-100 px-1"
              >
                <span className="flex-1 text-sm">{category.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={editing !== null}
                  onClick={() => {
                    setError(null);
                    setEditing({ id: category.id, name: category.name });
                  }}
                >
                  이름 바꾸기
                </Button>
                <button
                  type="button"
                  aria-label={`${category.name} 분류 삭제`}
                  disabled={editing !== null}
                  onClick={() => del(category)}
                  className="flex size-9 items-center justify-center rounded-md text-danger hover:bg-danger-soft disabled:opacity-40"
                >
                  <X className="size-4" />
                </button>
              </li>
            ),
          )}
          {editing?.id === 'new' && <li>{editor}</li>}
        </ul>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-danger-soft px-3 py-2.5 text-label leading-normal font-normal text-danger"
          >
            {error}
          </p>
        )}
        {editing?.id !== 'new' && (
          <button
            type="button"
            disabled={editing !== null}
            onClick={() => {
              setError(null);
              setEditing({ id: 'new', name: '' });
            }}
            className="mt-3 flex h-11 items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-400 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus className="size-4" />
            분류 추가
          </button>
        )}
      </div>
    </Sheet>
  );
}
