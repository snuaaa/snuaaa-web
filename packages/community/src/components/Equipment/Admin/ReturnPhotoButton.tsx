import { useState } from 'react';
import { Image } from 'lucide-react';

import { Dialog } from '~/components/ui';
import { resolveImageUrl } from '~/lib/utils';
import { Rent } from '~/services/types';

/** 반납 사진: the photo the member took when returning, in a dialog. */
export default function ReturnPhotoButton({
  rent,
  equipmentName,
}: {
  rent: Rent;
  equipmentName?: string;
}) {
  const [open, setOpen] = useState(false);
  const src = resolveImageUrl(rent.rentReturn?.photo_path);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        aria-label="반납 사진 보기"
        onClick={() => setOpen(true)}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-gray-100 hover:text-fg"
      >
        <Image className="size-4" />
      </button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="반납 사진"
        description={[equipmentName, rent.user.nickname]
          .filter(Boolean)
          .join(' · ')}
        className="md:max-w-xl"
      >
        <div className="px-6 pb-6">
          <img
            src={src}
            alt="반납할 때 찍은 장비 사진"
            className="max-h-[65vh] w-full rounded-md bg-gray-100 object-contain"
          />
        </div>
      </Dialog>
    </>
  );
}
