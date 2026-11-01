import { useEffect, useState } from 'react';
import { ImageUp, Loader2 } from 'lucide-react';

import { Button, Field, Input, Select, Sheet, Textarea } from '~/components/ui';
import {
  useCreateEquipment,
  useEquipmentCategories,
  useUpdateEquipment,
} from '~/hooks/queries/useEquipmentQueries';
import { resolveImageUrl } from '~/lib/utils';
import { CreateEquipmentRequest } from '~/services/EquipmentService';
import { Equipment, EquipmentStatus } from '~/services/types';
import UploadService from '~/services/UploadService';
import { equipmentStatusOptions } from '../common';

export type EquipmentFormTarget = { equipment?: Equipment } | null;

type EquipmentFormSheetProps = {
  /** null closes it; no equipment means 새 장비 등록. */
  target: EquipmentFormTarget;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const emptyForm: CreateEquipmentRequest = {
  name: '',
  nickname: '',
  category_id: 0,
  status: EquipmentStatus.OK,
  location: '',
  maker: '',
  description: '',
  img_path: '',
};

/** Only the editable fields, so the PATCH doesn't carry rent_status etc. */
const toForm = (equipment: Equipment): CreateEquipmentRequest => ({
  name: equipment.name,
  nickname: equipment.nickname ?? '',
  category_id: equipment.category_id,
  status: equipment.status,
  location: equipment.location ?? '',
  maker: equipment.maker ?? '',
  description: equipment.description ?? '',
  img_path: equipment.img_path ?? '',
});

/** 새 장비 등록 and 장비 정보 수정 share this form. */
export default function EquipmentFormSheet({
  target,
  onClose,
  onSaved,
}: EquipmentFormSheetProps) {
  const editing = target?.equipment;
  const { data: categories = [] } = useEquipmentCategories();
  const { mutateAsync: create, isPending: creating } = useCreateEquipment();
  const { mutateAsync: update, isPending: updating } = useUpdateEquipment();
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!target) return;
    setForm(target.equipment ? toForm(target.equipment) : emptyForm);
    setError(null);
    setSubmitted(false);
  }, [target]);

  const set = (patch: Partial<CreateEquipmentRequest>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const pick = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const { data } = await UploadService.uploadImage(file, 'equipment', true);
      set({ img_path: data.imgUrl });
    } catch (err) {
      console.error(err);
      setError('사진을 올리지 못했어요. 다시 골라 주세요.');
    } finally {
      setUploading(false);
    }
  };

  const missing = {
    name: !form.name.trim(),
    category: !form.category_id,
    location: !form.location.trim(),
    maker: !form.maker.trim(),
  };

  const submit = async () => {
    setSubmitted(true);
    if (Object.values(missing).some(Boolean)) return;
    setError(null);
    try {
      if (editing) {
        await update({ ...form, id: editing.id });
        onSaved('장비 정보를 저장했어요');
      } else {
        await create(form);
        onSaved('새 장비를 등록했어요');
      }
    } catch (err) {
      console.error(err);
      setError('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const required = (key: keyof typeof missing, message: string) =>
    submitted && missing[key] ? message : undefined;
  const image = resolveImageUrl(form.img_path);

  return (
    <Sheet
      open={target !== null}
      onOpenChange={(open) => !open && onClose()}
      title={editing ? '장비 정보 수정' : '새 장비 등록'}
      className="md:max-w-[760px]"
      footer={
        <div className="flex gap-2 md:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            size="lg"
            className="md:h-10"
          >
            취소
          </Button>
          <Button
            onClick={submit}
            loading={creating || updating}
            disabled={uploading}
            size="lg"
            className="flex-1 md:h-10 md:flex-none md:text-sm"
          >
            {editing ? '저장' : '등록'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 pb-2 md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-6 md:px-2">
        <div className="flex flex-col gap-2">
          <span className="text-label text-fg">장비 사진</span>
          <label
            htmlFor="equipment-photo"
            className="relative flex h-40 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border-[1.5px] border-dashed border-gray-400 bg-bg p-3 text-center text-caption text-gray-700 md:h-auto md:aspect-square"
          >
            {image ? (
              <>
                <img
                  src={image}
                  alt="장비 사진"
                  className="absolute inset-0 size-full object-cover"
                />
                <span className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2.5 py-1 text-caption font-semibold">
                  사진 바꾸기
                </span>
              </>
            ) : (
              <>
                <ImageUp className="size-[22px]" strokeWidth={1.8} />
                사진을 골라 주세요
              </>
            )}
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-navy-950/40 text-white">
                <Loader2
                  className="size-6 animate-spin"
                  aria-label="올리는 중"
                />
              </span>
            )}
          </label>
          <input
            id="equipment-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pick(file);
              e.target.value = '';
            }}
          />
        </div>
        <div className="grid grid-cols-2 content-start gap-x-3 gap-y-4">
          <Field
            label="장비명"
            required
            className="col-span-2"
            error={required('name', '장비명을 입력해 주세요')}
          >
            <Input
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </Field>
          <Field
            label="분류"
            required
            error={required('category', '분류를 골라 주세요')}
          >
            <Select
              value={form.category_id || ''}
              onChange={(e) => set({ category_id: Number(e.target.value) })}
            >
              <option value="" disabled>
                분류 선택
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="상태" required>
            <Select
              value={form.status}
              onChange={(e) =>
                set({ status: e.target.value as EquipmentStatus })
              }
            >
              {equipmentStatusOptions.map(({ value, name }) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="위치"
            required
            error={required('location', '보관 위치를 입력해 주세요')}
          >
            <Input
              value={form.location}
              placeholder="동아리방 2번 장"
              onChange={(e) => set({ location: e.target.value })}
            />
          </Field>
          <Field
            label="제조사"
            required
            error={required('maker', '제조사를 입력해 주세요')}
          >
            <Input
              value={form.maker}
              onChange={(e) => set({ maker: e.target.value })}
            />
          </Field>
          <Field label="별명" className="col-span-2">
            <Input
              value={form.nickname}
              onChange={(e) => set({ nickname: e.target.value })}
            />
          </Field>
          <Field label="추가 설명" className="col-span-2">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
          {error && (
            <p
              role="alert"
              className="col-span-2 text-label font-normal text-danger"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </Sheet>
  );
}
