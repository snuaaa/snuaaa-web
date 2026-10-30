import { useEffect, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

import { Button, Sheet } from '~/components/ui';
import { useReturnEquipment } from '~/hooks/queries/useEquipmentQueries';
import { MyRent } from '~/services/types';
import UploadService from '~/services/UploadService';

type ReturnSheetProps = {
  /** The rent being returned; null closes the sheet. */
  rent: MyRent | null;
  onClose: () => void;
  onReturned: () => void;
};

type Photo = { preview: string; url?: string; error?: boolean };

/** 반납: a photo of the item put back in its place, then 반납하기. */
export default function ReturnSheet({
  rent,
  onClose,
  onReturned,
}: ReturnSheetProps) {
  const { mutateAsync: returnEquipment, isPending } = useReturnEquipment();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [failed, setFailed] = useState(false);

  // Start over each time the sheet opens for another rent.
  useEffect(() => {
    setPhoto(null);
    setFailed(false);
  }, [rent?.id]);

  const preview = photo?.preview;
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const pick = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setPhoto({ preview });
    setFailed(false);
    try {
      const { data } = await UploadService.uploadImage(file, 'equipment', true);
      setPhoto((prev) =>
        prev?.preview === preview ? { preview, url: data.imgUrl } : prev,
      );
    } catch (err) {
      console.error(err);
      setPhoto((prev) =>
        prev?.preview === preview ? { preview, error: true } : prev,
      );
    }
  };

  const submit = async () => {
    if (!rent || !photo?.url) return;
    setFailed(false);
    try {
      await returnEquipment({ rentId: rent.id, photo_path: photo.url });
      onReturned();
    } catch (err) {
      console.error(err);
      setFailed(true);
    }
  };

  const uploading = Boolean(photo && !photo.url && !photo.error);

  return (
    <Sheet
      open={rent !== null}
      onOpenChange={(open) => !open && onClose()}
      title={rent ? `${rent.equipment.name} 반납하기` : '반납하기'}
      hideTitle
      footer={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-[52px] rounded-lg px-5 text-[15px]"
          >
            취소
          </Button>
          <Button
            onClick={submit}
            disabled={!photo?.url}
            loading={isPending}
            className="h-[52px] flex-1 rounded-lg text-base font-bold"
          >
            {photo?.url || uploading
              ? '반납하기'
              : '사진을 올리면 반납할 수 있어요'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 pb-2">
        <div className="mb-2 flex flex-col gap-1 px-1">
          <p className="text-[19px] font-bold">
            {rent?.equipment.name} 반납하기
          </p>
          <p className="text-label font-normal text-fg-muted">
            제자리에 둔 장비 사진을 찍어 주세요
          </p>
        </div>
        {photo ? (
          <div className="relative h-60 overflow-hidden rounded-xl bg-navy-800">
            <img
              src={photo.preview}
              alt="반납할 장비 사진"
              className="size-full object-contain"
            />
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-navy-950/40 text-white">
                <Loader2
                  className="size-7 animate-spin"
                  aria-label="올리는 중"
                />
              </span>
            )}
            <label
              htmlFor="return-photo"
              className="absolute right-2.5 bottom-2.5 flex h-9 cursor-pointer items-center rounded-full bg-white/90 px-3 text-label"
            >
              다시 찍기
            </label>
          </div>
        ) : (
          <label
            htmlFor="return-photo"
            className="flex h-60 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-gray-400 bg-bg text-[15px] font-semibold text-gray-700"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-accent">
              <Camera className="size-[26px]" strokeWidth={1.8} />
            </span>
            사진 찍기 · 앨범에서 선택
          </label>
        )}
        <input
          id="return-photo"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) pick(file);
            e.target.value = '';
          }}
        />
        {photo?.error && (
          <p role="alert" className="text-label font-normal text-danger">
            사진을 올리지 못했어요. 다시 골라 주세요.
          </p>
        )}
        {failed && (
          <p role="alert" className="text-label font-normal text-danger">
            반납하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>
    </Sheet>
  );
}
