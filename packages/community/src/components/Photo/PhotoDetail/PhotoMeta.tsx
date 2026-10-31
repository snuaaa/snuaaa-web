import { cn } from '~/lib/utils';

/** The shooting details shared by photos and exhibit photos. */
export type PhotoMetaFields = {
  date?: string | Date;
  location?: string;
  camera?: string;
  lens?: string;
  focal_length?: string;
  f_stop?: string;
  exposure_time?: string;
  iso?: string;
};

/** 2026.9.25 */
function formatShotDate(value?: string | Date) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

const withUnit = (value: string | undefined, unit: string) =>
  value && !value.trim().toLowerCase().endsWith(unit)
    ? `${value}${unit}`
    : value;

const withPrefix = (value: string | undefined, prefix: string) =>
  value && !value.trim().toLowerCase().startsWith(prefix)
    ? `${prefix}${value}`
    : value;

/** The shooting details that were filled in, in display order. */
function photoMetaItems(photo: PhotoMetaFields) {
  return [
    { label: '촬영일', value: formatShotDate(photo.date) },
    { label: '장소', value: photo.location },
    { label: '카메라', value: photo.camera },
    { label: '렌즈', value: photo.lens },
    {
      label: '초점거리',
      value: withUnit(photo.focal_length, 'mm'),
      numeric: true,
    },
    { label: '조리개', value: withPrefix(photo.f_stop, 'f/'), numeric: true },
    { label: '노출', value: photo.exposure_time, numeric: true },
    { label: 'ISO', value: photo.iso, numeric: true },
  ].filter((item) => item.value);
}

type PhotoMetaProps = {
  photo: PhotoMetaFields;
  /** `panel`: four columns in the desktop side panel. */
  variant?: 'page' | 'panel';
};

/** 촬영 정보: only the fields that were filled in. */
export default function PhotoMeta({ photo, variant = 'page' }: PhotoMetaProps) {
  const items = photoMetaItems(photo);
  if (items.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="촬영 정보"
      className={cn(
        'flex flex-col bg-gray-50',
        variant === 'page' ? 'gap-3.5 rounded-lg p-4' : 'rounded-[12px] p-3.5',
      )}
    >
      {variant === 'page' && (
        <h2 className="text-label font-bold">촬영 정보</h2>
      )}
      <dl
        className={cn(
          'grid',
          variant === 'page'
            ? 'grid-cols-2 gap-x-3 gap-y-3.5'
            : 'grid-cols-4 gap-x-2.5 gap-y-3',
        )}
      >
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-micro font-normal text-fg-muted">
              {item.label}
            </dt>
            <dd
              className={cn(
                'truncate font-medium',
                variant === 'page' ? 'text-sm' : 'text-label',
                item.numeric && 'tabular-nums',
              )}
              title={item.value}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
