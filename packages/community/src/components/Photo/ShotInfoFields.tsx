import { Input } from '~/components/ui';
import { SHOT_FIELDS, type ShotField } from './shotFields';

type ShotInfoFieldsProps = {
  /** 촬영일 as yyyy-MM-dd, the rest as typed. */
  values: Partial<Record<ShotField, string>>;
  onChange: (key: ShotField, value: string) => void;
};

/** The 촬영 정보 box: the date, place, gear and exposure of a photo. */
export default function ShotInfoFields({
  values,
  onChange,
}: ShotInfoFieldsProps) {
  return (
    <div
      role="group"
      aria-label="촬영 정보"
      className="flex flex-col gap-2.5 rounded-lg bg-gray-50 p-3.5"
    >
      <div className="text-label font-bold">촬영 정보</div>
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-2">
        {SHOT_FIELDS.map((field) => (
          <label key={field.key} className="flex min-w-0 flex-col gap-1">
            <span className="text-caption text-gray-700">{field.label}</span>
            <Input
              type={field.key === 'date' ? 'date' : 'text'}
              placeholder={field.placeholder}
              value={values[field.key] ?? ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="h-10 min-w-0 px-2.5"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
